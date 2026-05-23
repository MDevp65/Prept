import {
  Html,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Heading,
  Section,
} from "@react-email/components";

export default function WelcomeEmail({ userName = "there" }) {
  return (
    <Html>
      <Body
        style={{
          fontFamily: "Georgia, serif",
          padding: "32px 16px",
          backgroundColor: "#ffffff",
        }}
      >
        <Container
          style={{
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          {/* Logo / Header */}
          <Text
            style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}
          >
            Prept
          </Text>
          <Text
            style={{
              fontSize: "11px",
              color: "#6b7280",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: "0 0 32px",
            }}
          >
            Elevate Your Career
          </Text>

          <Heading style={{ fontSize: "20px", color: "#111827", marginBottom: "16px" }}>
            Welcome to the community, {userName}!
          </Heading>

          <Text style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>
            You’re officially ready to master your next big career move. Whether you're here to
            <strong> sharpen your interview skills</strong> or <strong>manage your latest projects</strong>,
            Prept gives you the tools to succeed in one place.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          {/* Value Propositions */}
          <Section>
            {[
              ["Practice", "Take or give mock interviews with industry peers."],
              ["Workspaces", "Create a workspace and invite your dream team."],
              ["Manage", "Keep projects on track with integrated task management."],
            ].map(([title, desc]) => (
              <div key={title} style={{ marginBottom: "16px" }}>
                <Text style={{ fontSize: "14px", margin: "0", color: "#111827", fontWeight: "700" }}>
                  {title}
                </Text>
                <Text style={{ fontSize: "13px", margin: "4px 0 0", color: "#6b7280" }}>
                  {desc}
                </Text>
              </div>
            ))}
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          <Button
            href="https://prept-sigma.vercel.app/"
            style={{
              backgroundColor: "#f59e0b",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "700",
              padding: "12px 28px",
              borderRadius: "8px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Get Started →
          </Button>

          <Text style={{ fontSize: "12px", color: "#9ca3af", marginTop: "32px" }}>
            If you have any questions, just reply to this email. We're here to help!
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
