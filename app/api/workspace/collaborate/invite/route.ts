import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/shared/middleware";

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const { assignmentId, email, role = "viewer", message } = body;

    if (!assignmentId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: assignmentId and email" },
        { status: 400 }
      );
    }

    // Check if user has permission to invite
    const hasPermission = await checkInvitePermission(assignmentId, userId);
    if (!hasPermission) {
      return NextResponse.json(
        {
          error: "You do not have permission to invite users to this workspace",
        },
        { status: 403 }
      );
    }

    // Check if user is already a collaborator
    const existingCollaborator = await getCollaborator(assignmentId, email);
    if (existingCollaborator) {
      return NextResponse.json(
        { error: "User is already a collaborator on this workspace" },
        { status: 409 }
      );
    }

    // Create invitation
    const invitation = await createInvitation(assignmentId, userId, {
      email,
      role,
      message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    });

    // Send invitation email
    await sendInvitationEmail(invitation);

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Invite User Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Missing assignmentId parameter" },
        { status: 400 }
      );
    }

    // Get collaborators
    const collaborators = await getCollaborators(assignmentId, userId);

    return NextResponse.json({
      success: true,
      collaborators,
    });
  } catch (error) {
    console.error("Get Collaborators Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

async function checkInvitePermission(assignmentId: string, userId: string) {
  // Check if user has permission to invite others
  // This would typically check the user's role in the workspace
  return true; // Mock: always allow for now
}

async function getCollaborator(assignmentId: string, email: string) {
  // Check if user is already a collaborator
  // This would typically query the database
  return null; // Mock: no existing collaborator
}

async function createInvitation(
  assignmentId: string,
  inviterId: string,
  data: any
) {
  // Create invitation record
  // This would typically save to the database
  return {
    id: `invitation_${Date.now()}`,
    assignmentId,
    inviterId,
    ...data,
  };
}

async function sendInvitationEmail(invitation: any) {
  // Send invitation email
  // This would typically use an email service like SendGrid
  console.log("Sending invitation email:", invitation);
}

async function getCollaborators(assignmentId: string, userId: string) {
  // Get list of collaborators
  // This would typically query the database
  return [
    {
      id: userId,
      name: "Current User",
      email: "user@example.com",
      role: "owner",
      isOnline: true,
      joinedAt: new Date(Date.now() - 86400000),
    },
  ];
}
