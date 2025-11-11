export interface ChecklistItemType {
  id: number;
  text: string;
  type: 'item' | 'section';
  completed: boolean; // only for 'item'
  indentation: number; // only for 'item'
}

export interface ChecklistStateType {
  id: number;
  title: string;
  checklistType: 'DO-CONFIRM' | 'READ-DO' | '';
  context: string;
  items: ChecklistItemType[];
  createdBy: string;
  completedBy: string;
}