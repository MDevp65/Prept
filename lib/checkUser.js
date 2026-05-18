import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";

const PLAN_CREDITS = {
  pro: 15,
  starter: 5,
  free: 1,
};

const getCurrentPlan = async () => {
  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const shouldAllocateCredits = (dbUser, currentPlan) => {
  // Always allocate if plan changed
  if (dbUser.currentPlan !== currentPlan) return true;

  // Allocate if never allocated before
  if (!dbUser.creditsLastAllocatedAt) return true;

  // Allocate if it's a new calendar month since last allocation
  const now = new Date();
  const last = new Date(dbUser.creditsLastAllocatedAt);
  const isNewMonth =
    now.getFullYear() > last.getFullYear() || now.getMonth() > last.getMonth();

  return isNewMonth;
};

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const currentPlan = await getCurrentPlan();
    const credits = PLAN_CREDITS[currentPlan];

    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) {
      // Interviewers don't have a credit subscription — skip allocation
      if (loggedInUser.role === "INTERVIEWER") return loggedInUser;

      if (shouldAllocateCredits(loggedInUser, currentPlan)) {
        // Roll forward any remaining credits from the previous period
        const rolledCredits = credits + (loggedInUser.credits ?? 0);

        return await db.user.update({
          where: { clerkUserId: user.id },
          data: {
            credits: rolledCredits,
            currentPlan,
            creditsLastAllocatedAt: new Date(),
          },
        });
      }

      return loggedInUser;
    }


    // New user — create with credits from their current plan
    const name = `${user.firstName} ${user.lastName}`;

    const html = await render(
      WelcomeEmail({
        userName: name
      })
    );
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.emailAddresses[0].emailAddress,
      subject: `Welcome to Prept — Let’s get you interview-ready`,
      html,
    });

    return await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        credits,
        currentPlan,
        creditsLastAllocatedAt: new Date(),
        // noOfFreeWorkspace: 0,
      },
    });
  } catch (error) {
    console.error("checkUser error:", error.message);
    return null;
  }
};