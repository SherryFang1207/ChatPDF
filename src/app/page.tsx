import FileUpload from "@/components/FileUpload";
import SubscriptionButton from "@/components/SubscriptionButton";
import { Button } from "@/components/ui/button";
import { checkSubscription } from "@/lib/subscription";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const { userId }: { userId: string | null } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  return (
    <section>
      <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
        {/* absolute middle container */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Flex Col Container */}
          <div className="flex flex-col items-center text-center">
            {/* Main Title Div */}
            <div className="flex items-center">
              <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
              <UserButton afterSignOutUrl="/" />
            </div>
            {/* Logged In: View Chat Div */}
            <div className="flex mt-2">
              {isAuth && firstChat && (
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Go to Chats
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              )}
              <div className="ml-3">
                <SubscriptionButton isPro={isPro} />
              </div>
            </div>
            {/* SubTitle Description Div */}
            <p className="max-w-xl mt-1 text-lg text-slate-600">
              Join millions of students, researchers and professionals to
              instantly answer questions and understand research with AI
            </p>
            {/* Get Started Button Div */}
            <div className="w-full mt-4">
              {isAuth ? (
                <FileUpload />
              ) : (
                <Link href="/sign-in">
                  <Button>
                    Log in to get Started!
                    <LogIn className="w-4 h-4 ml-2"></LogIn>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
