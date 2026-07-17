import { signOut, auth } from "@/auth";
import Link from 'next/link';

export default async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
        className="flex items-center gap-3"
      >
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={session.user.image} 
            alt={session.user.name || "User"} 
            className="w-8 h-8 rounded-full border border-hairline"
          />
        )}
        <button 
          type="submit"
          className="text-base font-medium text-muted hover:text-primary transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </form>
    );
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
