export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  targetMuscle: string;
  mechanics: string;
  safetyCue: string;
  difficulty: string;
  videoTutorialUrl?: string;
}

export interface DayRoutine {
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface AIRoutineResponse {
  routineName: string;
  objectiveSummary: string;
  schedule: DayRoutine[];
  generalTips: string[];
}

export interface ExerciseGuideDetails {
  id: string;
  name: string;
  category: "Pecho" | "Espalda" | "Piernas" | "Hombros" | "Bíceps/Tríceps" | "Core";
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
  correctKeypoints: string[];
  incorrectKeypoints: string[];
  tipsForAmateurs: string;
  cueAnglePoints: { x: number; y: number; label: string }[];
  unsplashUrl: string; // for visual representation
  stepByStep: string[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  exerciseName: string;
  setsLogged: { reps: number; weightKg: number }[];
  durationMinutes: number;
}

export interface DailyMotivation {
  id: string;
  text: string;
  author: string;
  category: "Energía" | "Disciplina" | "Enfoque" | "Recuperación";
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: string;
  url?: string;
  soundcloudUrl?: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  genre: string;
  description: string;
  icon: string;
  tracks: MusicTrack[];
  ownerId?: string;
  createdAt?: any;
  updatedAt?: any;
}
