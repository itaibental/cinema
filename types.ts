export interface CinematicElement {
  title: string;
  description: string;
  timecode?: string;
}

export interface CinematicAnalysis {
  synopsis: string;
  emotional_tone: string;
  visual_style: {
    shot_types: CinematicElement[]; // Close-ups, Long shots
    camera_angles: CinematicElement[]; // Low angle, High angle
    camera_movement: CinematicElement[]; // Pan, Tilt, Dolly
    lighting: string;
    color_palette: string;
  };
  audio_design: {
    music: string;
    sound_effects: string;
    dialogue: string;
  };
  editing: {
    pacing: string;
    transitions: string;
  };
  symbolism: string;
  verdict: string;
  sources?: { title: string; uri: string }[];
}

export enum AnalysisStatus {
  IDLE,
  PROCESSING,
  COMPLETED,
  ERROR
}