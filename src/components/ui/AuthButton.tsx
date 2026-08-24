import { auth } from "@/auth";
import Link from "next/link";
import { UserAccountMenu } from "./UserAccountMenu";

export default async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return <UserAccountMenu user={session.user} />;
  }

  return (
    <Link
      href="/login"
      className="px-5 py-2 border border-hairline rounded text-base font-medium hover:bg-surface-raised transition-colors"
    >
      Login
    </Link>
  );
}
