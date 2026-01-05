export enum DepartmentId {
  VEHICLES = 'vehicles',
  FINANCE = 'finance',
  SUPERVISORS = 'supervisors',
  NINJA_SUPERVISOR = 'ninja_supervisor',
  KMART_BIKES = 'kmart_bikes',
  HR = 'hr',
  PETROLEUM = 'petroleum',
  OPS_NAQEL = 'ops_naqel',
  OPS_NINJA = 'ops_ninja'
}

export interface Department {
  id: DepartmentId;
  nameAr: string;
  nameEn: string;
  prefix: string;
  roomNameAr: string;
  roomNameEn: string;
}

export interface Ticket {
  id: string;
  number: number;
  displayId: string;
  deptId: DepartmentId;
  status: 'waiting' | 'called' | 'completed';
  timestamp: number;
}

export interface QueueState {
  tickets: Ticket[];
  lastNumbers: Record<DepartmentId, number>;
}
