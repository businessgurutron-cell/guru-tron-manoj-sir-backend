create table if not exists flashcards (
  id text primary key,
  subject text not null,
  topic text not null,
  class_level text,
  exam_type text,
  question text not null,
  answer text not null,
  difficulty text default 'Moderate',
  created_at timestamptz default now()
);

create index if not exists idx_flashcards_subject_topic on flashcards(subject, topic);
