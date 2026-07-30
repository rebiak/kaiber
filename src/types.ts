export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface RoutineStep {
  id: string;
  title: string;
  notes?: string;
}

export interface Routine {
  id: string;
  title: string;
  icon: string;
  color: string; // Tailwind color name like 'blue', 'emerald', 'purple', 'amber', 'rose'
  steps: RoutineStep[];
  isFavorite?: boolean;
}

export interface PlanItem {
  id: string; // Unique instance ID in My Plan
  routineId: string;
  routineTitle: string;
  routineIcon: string;
  routineColor: string;
  stepId: string;
  stepTitle: string;
  status: StepStatus;
  notes?: string;
}

export interface DraggedSource {
  type: 'routine' | 'routine_step' | 'plan_item';
  routineId?: string;
  stepId?: string;
  planIndex?: number;
  itemData?: Partial<PlanItem>;
}
