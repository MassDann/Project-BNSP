import { auth } from "@/lib/auth";
import AlreadyLoggedInPopup from "@/components/AlreadyLoggedInPopup";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as any).role;
    return (
      <>
        {children}
        <AlreadyLoggedInPopup role={role} />
      </>
    );
  }
  return <>{children}</>;
}
