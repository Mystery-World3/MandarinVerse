import { Suspense } from "react";
import { INITIAL_COURSES } from "@/lib/curriculum/courses-data";
import LessonPlayerClient from "./LessonPlayerClient";

export function generateStaticParams() {
  const params: { courseId: string; lessonId: string }[] = [];
  for (const c of INITIAL_COURSES) {
    for (const u of c.units || []) {
      for (const l of u.lessons || []) {
        params.push({ courseId: c.id, lessonId: l.id });
      }
    }
  }
  return params;
}

async function LessonContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await paramsPromise;
  return <LessonPlayerClient courseId={courseId} lessonId={lessonId} />;
}

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LessonContent paramsPromise={params} />
    </Suspense>
  );
}
