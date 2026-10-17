import { Suspense } from "react";
import { INITIAL_COURSES } from "@/lib/curriculum/courses-data";
import CourseDetailClient from "./CourseDetailClient";

export function generateStaticParams() {
  return INITIAL_COURSES.map((c) => ({ courseId: c.id }));
}

async function CourseContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ courseId: string }>;
}) {
  const { courseId } = await paramsPromise;
  return <CourseDetailClient courseId={courseId} />;
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CourseContent paramsPromise={params} />
    </Suspense>
  );
}
