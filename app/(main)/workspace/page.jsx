import { getUserWorkSpaces } from '@/actions/workspace';
import PageHeader from '@/components/custom/reusables'
import { db } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import WorkspacePlanBadge from './_components/WorkspacePlanBadge';
import { redirect } from 'next/navigation';
import WorkSpaceCard from './_components/WorkSpaceCard';

const getCurrentPlan = async () => {
  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
};

const WorkSpacePage = async () => {

  const user = await currentUser();
  if (!user) redirect("/");

  const [dbUser, workSpaces] = await Promise.all([
    db.user.findUnique({
      where: { clerkUserId: user.id },
      select: {
        role: true,
        name: true,
        title: true,
        company: true,
        imageUrl: true,
        noOfFreeWorkspace: true,
      },
    }),
    getUserWorkSpaces(),
  ])

  const plan = await getCurrentPlan();
  const totalWrkspaces = plan === "free" ? 1 : plan === "starter" ? 5 : 15

  return (
    <main className="min-h-screen bg-black">
      {/* Page header */}
      <PageHeader
        label="YOUR WORKSPACES"
        gray="Welcome back,"
        gold={dbUser.name?.split(" ")[0] ?? "CEO"}
        description={
          dbUser.title && dbUser.company
            ? `${dbUser.title} · ${dbUser.company}`
            : ""
        }
        right={
          <WorkspacePlanBadge
            plan={plan}
            noOfFreeWorkspace={dbUser.noOfFreeWorkspace}
            totalWrkspaces={totalWrkspaces}
            user={dbUser}
          />
        }
      />

      {/* workspace grid */}
      <section className="my-5 mx-8">
        {
          workSpaces && workSpaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {
                workSpaces.map((workspace) => (
                  <WorkSpaceCard workspace={workspace} key={workspace.id} />
                ))
              }
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-yellow-500/30 rounded-lg bg-linear-to-b from-yellow-500/5 to-transparent p-8">
              <div className="text-center">
                <div className="mb-4 text-6xl">📋</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  No Workspaces Yet
                </h3>
                <p className="text-gray-400 mb-8 max-w-md">
                  Create your first workspace to start managing your team collaboration.
                </p>
                {/* <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8">
                  Create Your First Workspace
                </Button> */}
              </div>
            </div>
          )
        }
      </section>
    </main>
  )
}

export default WorkSpacePage