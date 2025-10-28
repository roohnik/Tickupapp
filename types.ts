// This file contains all the core type definitions for the application.
import React from 'react';

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  type: 'company' | 'individual'; // only if backend supports
  companyName?: string;
  owner_id?: string;
  owner?: { id: string; username: string; name?: string };
  settings?: Record<string, any>;
}

export interface UserPreferences {
  theme?: "light" | "dark";
  sidebarCollapsed?: boolean;
  activePage?: string;
  // add more user-specific settings here
}

export type Role = 'admin' | 'lead' | 'member';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;  //Role[] for multi-user role
  teamId?: string;
  avatarUrl: string;
  signatureUrl?: string;
  preferences?: UserPreferences;

}

export interface Team {
  id: string;
  name: string;
  leadId: string;
  memberIds: string[];
  icon: string;
  category: 'محصول' | 'فنی' | 'فروش' | 'بازاریابی' | 'عمومی' | string;
  lead?: User; // optional nested
  members?: User[]; // optional nested
}

export enum KRType {
  Number = 'NUMBER',
  Percentage = 'PERCENTAGE',
  Currency = 'CURRENCY',
}

export enum KRCategory {
  Standard = 'STANDARD',
  Stretch = 'STRETCH',
  Binary = 'BINARY',
  Assignment = 'ASSIGNMENT',
}

export interface StretchLevel {
    label: string;
    value: number;
}

export interface Podcast {
  id: string;
  title: string;
  description?: string;
  url?: string;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  provider?: string;
  duration?: number;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  recurrence?: {
    frequency: "none" | "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;
    daysOfWeek?: number[]; // for weekly recurrence
  };
  color?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
export interface RecurrenceSettings {
  timeRange: {
    start: number;
    end: number;
  };
}


export interface CheckIn {
  id: string;
  date: string; // ISO string
  value: number;
  rating: number; // 1-5
  report: string | {
    tasksDone: string;
    tasksNext: string;
    challenges: string;
  };
  challengeDifficulty: number; // 1-5
  feedbackTagId?: string;
  feedbackComment?: string;
  feedbackRating?: number;
  feedbackGiverId?: string;
  challengeTagIds?: string[];
}

// FIX: Added DailyTarget interface for daily key result tracking.
export interface DailyTarget {
    type: KRType;
    target: number;
    current: number;
}

export interface PeriodicTarget {
  period: 'daily' | 'weekly';
  type: KRType;
  target: number;
  current: number;
}

export interface KeyResult {
  objective_id: string;
  id: string;
  title: string;
  ownerId: string;
  category: KRCategory;
  currentValue: number; // For Standard/Stretch: value. For Binary: 0 or 1. For Assignment: count of completed items.
  checkIns: CheckIn[];
  isArchived?: boolean;
  comments?: Comment[];
  
  // For Standard type
  type?: KRType;
  startValue?: number;
  targetValue?: number;
  periodicTarget?: PeriodicTarget;
  // FIX: Added optional dailyTarget property to support daily key result tracking.
  dailyTarget?: DailyTarget;

  // For Stretch type
  stretchLevels?: StretchLevel[];

  // For Binary type
  binaryLabels?: { incomplete: string; complete: string };

  // For Assignment type
  assignedTaskIds?: string[];
  assignedFormIds?: string[];
}


export type ObjectiveCategoryId = 'BUSINESS_GROWTH' | 'CUSTOMER_MARKET' | 'PRODUCT_INNOVATION' | 'PROCESS_EFFICIENCY' | 'HR_CULTURE' | 'FINANCE_PROFITABILITY' | 'SUSTAINABILITY' | 'QUALITY_STANDARDS' | 'TECH_DIGITALIZATION' | 'COMMUNICATION_BRANDING';

export interface Objective {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  keyResults: KeyResult[];
  strategyId?: string;
  indexIds?: string[];
  category?: ObjectiveCategoryId;
  parentId?: string;
  isArchived?: boolean;
  color?: string;
}

export interface SuggestedKR {
    title: string;
    type: KRType;
    startValue: number;
    targetValue: number;
}

export interface SuggestedObjectiveWithKRs {
    objectiveTitle: string;
    objectiveDescription: string;
    keyResults: SuggestedKR[];
}

export interface SuggestedPerspective {
    perspectiveTitle: string;
    perspectiveDescription: string;
    objectives: SuggestedObjectiveWithKRs[];
}


export type KanbanColumnId = string;
export const WORKFLOW_STATES = ['برای انجام', 'در حال پیشرفت', 'انجام شد'] as const;
export type TaskWorkflowState = typeof WORKFLOW_STATES[number];

export interface Recurrence {
    frequency: 'hourly' | 'every-2-hours' | 'every-3-hours' | 'every-6-hours' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
}

export interface RecurrenceSettings {
    timeRange: {
        start: number; // Hour (0-23)
        end: number;   // Hour (0-23)
    }
}

export interface Tag {
    id: string;
    text: string;
    color: string; // e.g., 'red', 'blue'
}

export interface Comment {
    id: string;
    authorId: string;
    text: string;
    createdAt: string; // ISO string
}

export interface ChecklistItem {
    id:string;
    text: string;
    completed: boolean;
}

// FIX: Added CustomField types to support custom fields in tasks.
export type CustomFieldType = 'TEXT_SHORT' | 'TEXT_LONG' | 'NUMBER' | 'COST' | 'CONFIRMATION' | 'PHONE' | 'DOCUMENT' | 'FORM';

export interface CustomFieldDefinition {
    id: string;
    label: string;
    type: CustomFieldType;
}

export interface CustomField {
    definitionId: string;
    value: string | number | boolean | string[] | null;
}

export interface MonitoringData {
    temperature?: number | null;
    cost?: number | null;
    pieceCount?: number | null;
    responsiblePersonId?: string | null;
    category?: 'دسته اول' | 'دسته دو' | 'دسته سوم' | null;
}


export type PrerequisiteType = 'TASK' | 'FORM' | 'KANBAN_LIST' | 'DOCUMENT_STUDY';

export interface TaskPrerequisite {
    type: 'TASK';
    taskIds: string[];
}

export interface FormPrerequisite {
    type: 'FORM';
    formIds: string[];
}

export interface KanbanListPrerequisite {
    type: 'KANBAN_LIST';
    projectId: string;
    columnId: string;
}

export interface DocumentStudyPrerequisite {
    type: 'DOCUMENT_STUDY';
    documentId: string;
}

export type Prerequisite = TaskPrerequisite | FormPrerequisite | KanbanListPrerequisite | DocumentStudyPrerequisite;


export interface Task {
  id: string;
  icon?: string;
  content: string;
  description?: string;
  columnId: KanbanColumnId;
  status: TaskWorkflowState;
  projectId: string;
  assigneeId: string;
  assigneeTeamId?: string;
  assignee?: { id: string; username: string }; 
  column?: { id: string; title: string; color?: string }; 
  startDate?: string; // ISO string
  dueDate?: string; // ISO string
  progress?: number; // 0-100
  recurrence?: Recurrence;
  tags?: Tag[];
  comments?: Comment[];
  checklist?: ChecklistItem[];
  // FIX: Added optional customFields property to support custom fields in tasks.
  customFields?: CustomField[];
  monitoring?: MonitoringData;
  dailyTargetKrId?: string; // Link to the KeyResult that generated this task
  parentId?: string; // ID of the parent task
  color?: string; // For timeline bar color
  numericValue?: number;
  prerequisites?: Prerequisite[];
  prerequisiteCompletion?: {
      [documentId: string]: string[]; // maps doc ID to array of completed heading block IDs
  }
    isArchived?: boolean;

}

export interface KanbanColumn {
    id: string;
    title: string;
    color?: string;
    icon?: string;
    processStartDate?: string;
    processEndDate?: string;
    processDescription?: string;
}

export type ViewMode = 'board' | 'calendar' | 'table' | 'timeline' | 'process' | 'card';

export interface Board {
  id: string;
  name: string;
  projectId: string | 'all';
  defaultViewMode: ViewMode;
  enabledViews?: ViewMode[];
  isPinned?: boolean;
  color?: string;
  tableViewColumns?: string[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProjectRisk {
  id: string;
  description: string;
  likelihood: RiskLevel;
  severity: RiskLevel;
}

export interface Project {
  id: string;
  name: string;
  objectiveId: string;
  keyResultId?: string;
  color?: string;
  description?: string;
  missionStatement?: string;
  objectiveAlignmentExplanation?: string;
  impactIfNotDone?: string;
  projectGoals?: string;
  projectScope?: string;
  memberIds?: string[];
  risks?: ProjectRisk[];
  customFieldDefinitions?: CustomFieldDefinition[];
  custom_fields?: CustomField[];
  enabledViews?: ViewMode[];
  isArchived?: boolean;
}

export type StrategyCategory =
  | 'محور ارزش‌آفرینی برای مشتری'
  | 'فروش'
  | 'توسعه محصول'
  | 'توسعه بازار'
  | 'محور تعالی عملیاتی و بهره‌وری'
  | 'محور توانمندسازی تیم و فرهنگ سازمانی'
  | 'محور آگاهی از برند و اعتبار'
  | 'محور تعالی فرآیندها'
  | 'محور داده‌محوری'
  | 'دیجیتال و هوش مصنوعی'
  | 'زیرساخت فنی و مقیاس‌پذیری'
  | 'اقیانوس آبی';

export type StrategyStatus = 'در جریان' | 'متوقف شده است' | 'در حال برنامه ریزی';

export interface SwotData {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  icon: string;
  ownerIds: string[];
  isArchived?: boolean;
  category: StrategyCategory;
  status: StrategyStatus;
  startDate?: string;
  endDate?: string;
  swot?: SwotData;
}


export interface Index {
  id: string;
  name: string;
  category: string;
  icon: string;
  ownerIds: string[];
  strategyId?: string;
  unit?: string;
  currentValue?: number;
  targetValue?: number;
  isArchived?: boolean;
}

export interface CompanyValue {
  id: string;
  text: string;
  icon: string;
  color: string;
}

export interface CompanyVision {
  missionTitle: string;
  passion?: string;
  skill?: string;
  market?: string;
  business?: string;
  fiveYearVision?: string;
  values?: CompanyValue[];
}

// =================================================================
// NEW FORM BUILDER TYPES
// =================================================================

export type FormFieldType = 
    | 'TEXT'
    | 'TEXTAREA'
    | 'NUMBER'
    | 'EMAIL'
    | 'DATE'
    | 'SELECT'
    | 'CHECKBOX'
    | 'RADIO'
    | 'RATING'
    | 'CONFIRMATION'
    | 'FILE_UPLOAD'
    | 'MATRIX_SINGLE'
    | 'SIGNATURE'
    | 'SECTION'
    | 'DYNAMIC_TABLE'
    | 'APPROVAL';

export interface FormFieldOption {
    id: string;
    label: string;
}

// NEW CALCULATION TYPES
export interface OptionScore {
    optionId: string;
    score: number;
}

export interface ValueScore {
    value: string | boolean; // For APPROVAL, CONFIRMATION
    score: number;
}

export type NumberCalculationCondition = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';

export interface NumberCalculationRule {
    id: string;
    condition: NumberCalculationCondition;
    value1: number;
    value2?: number; // For BETWEEN
    score: number;
}

export interface CalculationSettings {
    optionScores?: OptionScore[]; 
    valueScores?: ValueScore[]; 
    ratingScores?: { [rating: number]: number };
    numberRules?: {
        rules: NumberCalculationRule[];
        defaultScore: number;
    };
}
// END NEW CALCULATION TYPES

export interface FormField {
    id: string;
    label: string;
    type: FormFieldType;
    isRequired: boolean;
    placeholder?: string;
    options?: FormFieldOption[];
    // Properties for MATRIX_SINGLE type
    matrixRows?: FormFieldOption[];
    matrixColumns?: FormFieldOption[];
    icon?: string;
    description?: string;
    // Properties for SIGNATURE type
    signerUserIds?: string[];
    // Properties for DYNAMIC_TABLE type
    subFields?: FormField[];
    // NEW
    calculationConfig?: CalculationSettings;
    allowPhoto?: boolean;
    allowNote?: boolean;
}

export interface FormVariable {
    id: string;
    name: string;
    icon: string;
    purpose: string;
    label: string;
    fieldIds: string[];
}

export interface Form {
    id: string;
    title: string;
    description: string;
    categoryId: string; // Linked to FormCategory
    fields: FormField[];
    creatorId: string;
    dueDate?: string; // ISO string
    recurrence?: Recurrence;
    isPinned?: boolean;

    // NEW FIELDS FOR FORM SPECS
    formCode?: string;
    approvalDate?: string; // ISO string
    version?: string;
    unit?: string;
    approvalCode?: string; // "کد تایید فرم"
    documentRequestNumber?: string; // "شماره درخواست مدرک"
    nextSerialNumber?: number; // Tracks the next serial number to be assigned
    displayMode?: 'SINGLE_PAGE' | 'MULTI_STEP';
    // NEW
    enableCalculations?: boolean;
    maxScore?: number;
    variables?: FormVariable[];
    boardId?: string; // ID of the Kanban board it's moved to
    columnId?: string; // ID of the specific "Forms" column on that board
}

export type FormCategory = KanbanColumn;


// =================================================================
// FORM SUBMISSION TYPES
// =================================================================

export interface FormFieldValue {
    fieldId: string;
    label: string; // Store label for easier display
    value: string | number | boolean | string[] | { [rowId: string]: string } | { [userId: string]: { signatureUrl: string; signedAt: string } } | Array<Record<string, any>> | null;
    photo?: string; // base64 data url
    note?: string;
}

export interface FormSubmission {
    id: string;
    formId: string;
    submittedAt: string; // ISO string
    submittedById: string; // userId
    values: FormFieldValue[];
    serialNumber?: string; // The serial number for this specific submission
    status: 'DRAFT' | 'SUBMITTED';
}

// =================================================================
// PROCESS TYPES
// =================================================================

export interface Process {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  unit: string;
  variableIds: string[];
}

// =================================================================
// DOCUMENT EDITOR TYPES
// =================================================================

export interface TableContent {
  rows: string[][];
  columnWidths?: number[];
  rowColors?: (string | undefined)[];
  columnColors?: (string | undefined)[];
  rowTextColors?: (string | undefined)[];
  columnTextColors?: (string | undefined)[];
  hasHeaderRow?: boolean;
}

export interface ChecklistContent {
  text: string;
  checked: boolean;
}

export interface ImageContent {
  src: string; // base64 data URL
  caption: string;
}

export interface FileContent {
  name: string;
  size: string;
  url: string; // can be data URL or placeholder
}

export interface DateContent {
  date: string; // ISO string
}

export interface MentionContent {
  userId: string;
}

export interface TaskLinkContent {
  taskId: string;
}

export interface FormLinkContent {
  formId: string;
}

export type DocumentBlockType =
  | 'paragraph'
  | 'heading1'
  | 'table'
  | 'checklist'
  | 'numberedList'
  | 'image'
  | 'file'
  | 'date'
  | 'mention'
  | 'taskLink'
  | 'formLink';

export interface DocumentBlock {
  id: string;
  type: DocumentBlockType;
  content:
    | string
    | TableContent
    | ChecklistContent
    | ImageContent
    | FileContent
    | DateContent
    | MentionContent
    | TaskLinkContent
    | FormLinkContent;
  textAlign?: 'right' | 'center' | 'left';
}

export interface DocumentStatus {
  id: string;
  label: string;
  color: string; // Tailwind color class bg-red-500
  textColor: string; // Tailwind color class text-red-100
}


export interface Document {
  id: string;
  title: string;
  icon: string;
  content: DocumentBlock[];
  fontFamily?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  creatorId: string;
  createdAt: string; // ISO String
  lastUpdatedAt: string; // ISO String
  statusId: string;
}

// =================================================================
// LEARNING HUB TYPES
// =================================================================

export enum LearningResourceType {
  MICRO_LEARNING = 'MICRO_LEARNING',
  YOUTUBE_VIDEO = 'YOUTUBE_VIDEO',
  BOOK = 'BOOK',
}
export enum LearningAssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface MicroLearning {
  id: string;
  topic: string; // The manager's prompt
  generatedText: string; // The AI-generated content
  quiz: QuizQuestion[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  tags: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
}

export type LearningResource = MicroLearning | YouTubeVideo | Book;

export interface LearningAssignment {
  id: string;
  assigneeId: string;
  assignerId: string;
  resourceId: string;
  resourceType: LearningResourceType;
  assignedAt: string; // ISO String
  status: LearningAssignmentStatus;
  triggerObjectiveId?: string;
  triggerFeedbackId?: string;
  completedAt?: string; // ISO String
  quizScore?: number; // For MICRO_LEARNING, e.g., 80 for 80%
}


export type ActivePage = 'dashboard' | 'reports' | 'insights' | 'strategy' | 'kanban' | 'forms' | 'settings' | 'anjam' | 'documents' | 'learning' | 'feedback' | 'team' | 'personalDevelopment' | 'customers' | 'sales' | 'crm' | 'production' | 'quality' | 'inventory' | 'purchasing' | 'marketing' | 'recruitment' | 'expenses' | 'contracts' | 'selfKnowledge' | 'organizationalKnowledge' | 'consulting' | 'upgrade' | 'aiChat' | 'projects';

// =================================================================
// FEEDBACK TYPES
// =================================================================
export type FeedbackCategory = 'TASKS' | 'PROCESSES' | 'OBJECTIVES' | 'STRATEGIES';

export interface GeneralFeedback {
  id: string;
  giverId: string;
  receiverId: string;
  category: FeedbackCategory;
  comment: string;
  tagIds: string[];
  createdAt: string; // ISO String
  attachedTaskIds?: string[];
  attachedFormIds?: string[];
}

export interface FeedbackTag {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon component name
  color: string; // Hex color string
}

export interface Consultant {
  id: string;
  name: string;
  specialty: string;
  color: string; // Hex color
  systemInstruction: string;
}

// =================================================================
// NOTIFICATION TYPES
// =================================================================
export interface Notification {
  id: string;
  title: string;
  summary: string;
  timestamp: string; // ISO string
  isRead: boolean;
  type: 'task' | 'objective' | 'feedback' | 'mention';
  itemId: string; // ID of the task, objective, etc.
  userId: string; // The user this notification is for
}

// =================================================================
// VALUE DEFINITION TYPES
// =================================================================
//Missing fields that exist in the backend (e.g., title, status, priority, optional source, timestamps).
export type CustomerNeedCategoryType = 'ESSENTIAL' | 'PERFORMANCE' | 'MOTIVATIONAL';

export interface CustomerNeedCategory {
  id: string;
  name: CustomerNeedCategoryType;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerNeed {
  id: string;
  title: string;               // new field
  description: string;
  category_id?: string;        // FK to category
  category?: CustomerNeedCategory; // optional object for frontend use
  priority: 'low' | 'medium' | 'high' | 'critical'; // new field
  source?: string;             // optional
  status: 'open' | 'in_progress' | 'resolved'; // new field
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}


// =================================================================
// APPLICATION SETTINGS TYPES
// =================================================================
export interface AppSettings {
    timezone: string;
}

export interface TaskFieldLabels {
    assigneeId: string;
    status: string;
    startDate: string;
    dueDate: string;
    recurrence: string;
    progress: string;
    numericValue: string;
}

export type FormDisplayStyle = 'DEFAULT' | 'MINIMAL_CARD' | 'VISUAL' | 'SPACIOUS' | 'SPACIOUS_CARD';

export interface StyleSettings {
    fontFamily: string;
    fontSize: 'sm' | 'base' | 'lg';
    primaryColor: string;
    backgroundColor: string;
    formDisplayStyle?: FormDisplayStyle;
}

export interface ComponentStyles {
  popups: StyleSettings;
  strategyCards: StyleSettings;
}

export type HierarchicalViewStyle = 'MIND_MAP' | 'CIRCULAR' | 'ORG_CHART' | 'ADVANCED_ORG_CHART';

export interface ObjectiveSettings {
    hierarchicalViewStyle: HierarchicalViewStyle;
}

// FIX: Moved NavItem and SidebarConfig from App.tsx to make them globally available.
export type NavItem =
    | {
        type: 'item';
        id: ActivePage;
        label: string;
        Icon: React.FC<any>;
        roles: User['role'][];
        visible: boolean;
        location?: 'main' | 'more' | 'footer';
        isExpandable?: boolean;
      }
    | {
        type: 'divider';
        id: string;
        visible: boolean;
      };

export type SidebarTheme = 'default' | 'modern' | 'visual' | 'compact';

export interface SidebarConfig {
    navItems: NavItem[];
    theme: SidebarTheme;
    anjamButtonStyle: 'default' | 'prominent';
}

// =================================================================
// AI ASSISTANT TYPES
// =================================================================
export type AIDisplayContentType = 'form' | 'kanban' | 'anjam' | 'objective';
export interface AIDisplayContent {
    type: AIDisplayContentType | null;
    id: string | 'all' | null;
}
