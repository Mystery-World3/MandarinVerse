import { INITIAL_ACHIEVEMENTS, INITIAL_COURSES } from "../curriculum/courses-data";
import { isPostgresConfigured, query } from "./index";

export async function runSeed(): Promise<{ success: boolean; message: string }> {
  if (!isPostgresConfigured()) {
    return {
      success: false,
      message:
        "DATABASE_URL belum dikonfigurasi. Data tersimpan di storage lokal MandarinVerse.",
    };
  }

  try {
    // 1. Seed Courses, Units, Lessons, Vocabulary, Quizzes
    for (const course of INITIAL_COURSES) {
      await query(
        `INSERT INTO courses (id, slug, title, title_chinese, description, level, path_index, order_index, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           title_chinese = EXCLUDED.title_chinese,
           description = EXCLUDED.description`,
        [
          course.id,
          course.slug,
          course.title,
          course.titleChinese,
          course.description,
          course.level,
          course.pathIndex,
          course.orderIndex,
          course.isPublished,
        ]
      );

      for (const unit of course.units || []) {
        await query(
          `INSERT INTO units (id, course_id, title, title_chinese, description, order_index, is_published)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             title_chinese = EXCLUDED.title_chinese,
             description = EXCLUDED.description`,
          [
            unit.id,
            course.id,
            unit.title,
            unit.titleChinese,
            unit.description,
            unit.orderIndex,
            unit.isPublished,
          ]
        );

        for (const lesson of unit.lessons || []) {
          await query(
            `INSERT INTO lessons (id, unit_id, title, title_chinese, description, order_index, estimated_minutes, content_json, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title,
               title_chinese = EXCLUDED.title_chinese,
               description = EXCLUDED.description,
               content_json = EXCLUDED.content_json`,
            [
              lesson.id,
              unit.id,
              lesson.title,
              lesson.titleChinese,
              lesson.description,
              lesson.orderIndex,
              lesson.estimatedMinutes,
              JSON.stringify(lesson.content),
              lesson.isPublished,
            ]
          );

          for (const vocab of lesson.content.vocabulary || []) {
            await query(
              `INSERT INTO vocabulary (id, lesson_id, hanzi, pinyin, indonesian, english, part_of_speech, example_chinese, example_pinyin, example_indonesian, mnemonic)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               ON CONFLICT (id) DO UPDATE SET
                 hanzi = EXCLUDED.hanzi,
                 pinyin = EXCLUDED.pinyin,
                 indonesian = EXCLUDED.indonesian,
                 example_chinese = EXCLUDED.example_chinese,
                 example_pinyin = EXCLUDED.example_pinyin,
                 example_indonesian = EXCLUDED.example_indonesian`,
              [
                vocab.id,
                lesson.id,
                vocab.hanzi,
                vocab.pinyin,
                vocab.indonesian,
                vocab.english || null,
                vocab.partOfSpeech,
                vocab.exampleChinese,
                vocab.examplePinyin,
                vocab.exampleIndonesian,
                vocab.mnemonic || null,
              ]
            );
          }
        }

        for (const quiz of unit.quizzes || []) {
          await query(
            `INSERT INTO quizzes (id, lesson_id, unit_id, title, description, passing_score, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title,
               description = EXCLUDED.description,
               passing_score = EXCLUDED.passing_score`,
            [
              quiz.id,
              quiz.lessonId || null,
              unit.id,
              quiz.title,
              quiz.description,
              quiz.passingScore,
              quiz.isPublished,
            ]
          );

          for (const q of quiz.questions || []) {
            await query(
              `INSERT INTO quiz_questions (id, quiz_id, type, prompt, prompt_pinyin, prompt_audio, options_json, correct_answer, explanation, order_index)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               ON CONFLICT (id) DO UPDATE SET
                 prompt = EXCLUDED.prompt,
                 options_json = EXCLUDED.options_json,
                 correct_answer = EXCLUDED.correct_answer,
                 explanation = EXCLUDED.explanation`,
              [
                q.id,
                quiz.id,
                q.type,
                q.prompt,
                q.promptPinyin || null,
                q.promptAudio || null,
                JSON.stringify(q.options),
                JSON.stringify(q.correctAnswer),
                q.explanation,
                q.orderIndex,
              ]
            );
          }
        }
      }
    }

    // 2. Seed Achievements
    for (const ach of INITIAL_ACHIEVEMENTS) {
      await query(
        `INSERT INTO achievements (id, code, title, title_chinese, description, icon, xp_reward, condition_type, condition_threshold)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           title_chinese = EXCLUDED.title_chinese,
           description = EXCLUDED.description,
           xp_reward = EXCLUDED.xp_reward`,
        [
          ach.id,
          ach.code,
          ach.title,
          ach.titleChinese,
          ach.description,
          ach.icon,
          ach.xpReward,
          ach.conditionType,
          ach.conditionThreshold,
        ]
      );
    }

    return {
      success: true,
      message: "Data kurikulum dan pencapaian berhasil di-seed ke Neon PostgreSQL!",
    };
  } catch (err: any) {
    console.error("Seed error:", err);
    return {
      success: false,
      message: `Gagal melakukan seeding: ${err.message}`,
    };
  }
}
