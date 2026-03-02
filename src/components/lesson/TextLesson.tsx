interface TextLessonProps {
  body: string
}

export function TextLesson({ body }: TextLessonProps) {
  return <p className="leading-relaxed text-slate-700">{body}</p>
}
