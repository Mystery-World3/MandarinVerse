import { Suspense } from "react";
import { INITIAL_COURSES } from "@/lib/curriculum/courses-data";
import QuizPlayerClient from "./QuizPlayerClient";

export function generateStaticParams() {
  const params: { courseId: string; quizId: string }[] = [];
  for (const c of INITIAL_COURSES) {
    for (const u of c.units || []) {
      for (const q of u.quizzes || []) {
        params.push({ courseId: c.id, quizId: q.id });
      }
    }
  }
  return params;
}

async function QuizContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = await paramsPromise;
  return <QuizPlayerClient courseId={courseId} quizId={quizId} />;
}

export default function QuizPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QuizContent paramsPromise={params} />
    </Suspense>
  );
}
