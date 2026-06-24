import { UserRole, BookingStatus } from '../constants/roles';

export interface IUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  department?: string | null;
  student_class?: string | null;
  blacklist_reason?: string | null;
  trust_score?: number;
  phone?: string;
  is_mfa_enabled?: boolean;
  avatar_url?: string | null;
  is_deleted?: boolean;
  refresh_token?: string | null;
  mfa_secret?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface IRoom {
  id: number;
  name: string;
  location: string;
  capacity: number;
  has_air_conditioner: boolean;
  status: string;
  is_deleted: boolean;
  image_url?: string;
  _count?: {
    equipment: number;
  };
  equipment?: IEquipment[];
}

export interface IEquipment {
  id: number;
  name: string;
  serial_number: string;
  status: string;
  room_id: number;
  last_maintenance?: string | null;
  purchase_date?: string | null;
  value?: number | null;
  maintenance_interval_months?: number | null;
  image_url?: string | null;
  supplier_id?: number | null;
  row_version?: number;
  is_deleted: boolean;
  updated_at?: string;
}

export interface IBooking {
  id: number;
  user_id: number;
  room_id: number;
  equipment_id?: number | null;
  course_id?: number | null;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  purpose: string;
  created_at: string;
  user?: Partial<IUser>;
  room?: Partial<IRoom>;
  equipment?: Partial<IEquipment>;
  course?: Partial<ICourse>;
  chemical_usages?: any[];
  updated_at?: string;
}

export interface ICourse {
  id: number;
  code: string;
  name: string;
  instructor_id: number;
  semester: string;
  academic_year: string;
  instructor?: Partial<IUser>;
  created_at: string;
}

export interface IChemical {
  id: number;
  name: string;
  unit: string;
  quantity_stock: number;
  expiration_date?: string | null;
  status?: string;
  formula?: string | null;
  storage_conditions?: string | null;
  min_stock_alert?: number;
  image_url?: string | null;
  is_deleted?: boolean;
  supplier_id?: number | null;
}

export interface IReport {
  id: number;
  title: string;
  description: string;
  status: string;
  user_id: number;
  equipment_id?: number | null;
  room_id?: number | null;
  assignee_id?: number | null;
  priority?: string;
  resolution?: string | null;
  created_at: string;
  user?: Partial<IUser>;
  equipment?: Partial<IEquipment>;
  room?: Partial<IRoom>;
}

export interface INotification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  type?: string;
  created_at: string | Date;
}

export interface IComment {
  id: number;
  report_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: Partial<IUser>;
}

export interface IMaintenance {
  id: number;
  equipment_id: number;
  description: string;
  cost: number;
  performed_by: string;
  date: string;
  created_at: string;
  equipment?: Partial<IEquipment>;
}

export interface ICombo {
  id: number;
  name: string;
  description?: string;
  equipment_ids: number[];
  created_at: string;
}

export interface ISupplier {
  id: number;
  name: string;
  contact_info: string;
  created_at: string;
}

export interface IRating {
  id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface IPenalty {
  id: number;
  user_id: number;
  report_id?: number | null;
  reason: string;
  penalty_amount?: number | null;
  is_paid: boolean;
  created_at: string;
  user?: Partial<IUser>;
}

export interface IChemicalTransaction {
  id: number;
  chemical_id: number;
  user_id: number;
  quantity: number;
  type: 'IMPORT' | 'EXPORT' | 'RETURN';
  notes?: string;
  created_at: string;
}

export interface IInventoryCheck {
  id: number;
  chemical_id: number;
  system_quantity: number;
  actual_quantity: number;
  notes?: string;
  created_at: string;
}
