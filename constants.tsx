
import { DepartmentId, Department } from './types';

export const DEPARTMENTS: Department[] = [
  {
    id: DepartmentId.VEHICLES,
    nameAr: "قسم المركبات",
    nameEn: "Vehicles Section",
    prefix: "V",
    roomNameAr: "مكتب المركبات",
    roomNameEn: "Vehicles Office"
  },
  {
    id: DepartmentId.FINANCE,
    nameAr: "قسم المالية - المدير المالي",
    nameEn: "Finance Section - Finance Manager",
    prefix: "F",
    roomNameAr: "مكتب المدير المالي",
    roomNameEn: "Financial Manager Office"
  },
  {
    id: DepartmentId.SUPERVISORS,
    nameAr: "قسم المشرفين",
    nameEn: "Supervisors Section",
    prefix: "S",
    roomNameAr: "مكتب المشرفين",
    roomNameEn: "Supervisors Office"
  },
  {
    id: DepartmentId.NINJA_SUPERVISOR,
    nameAr: "مشرف نينجا",
    nameEn: "Ninja Supervisor",
    prefix: "NS",
    roomNameAr: "مكتب مشرف نينجا",
    roomNameEn: "Ninja Supervisor Office"
  },
  {
    id: DepartmentId.KMART_BIKES,
    nameAr: "مشرف كيمارت ودبابات نينجا",
    nameEn: "K-Mart & Ninja Bikes Supervisor",
    prefix: "K",
    roomNameAr: "مكتب مشرف الكيمارت",
    roomNameEn: "K-Mart Supervisor Office"
  },
  {
    id: DepartmentId.HR,
    nameAr: "مدير الموارد البشرية",
    nameEn: "HR Manager",
    prefix: "HR",
    roomNameAr: "مكتب الموارد البشرية",
    roomNameEn: "HR Manager Office"
  },
  {
    id: DepartmentId.PETROLEUM,
    nameAr: "قسم البترول",
    nameEn: "Petroleum Section",
    prefix: "P",
    roomNameAr: "مكتب البترول",
    roomNameEn: "Petroleum Office"
  },
  {
    id: DepartmentId.OPS_NAQEL,
    nameAr: "مدير مشروع ناقل",
    nameEn: "Naqel Project Manager",
    prefix: "ON",
    roomNameAr: "مكتب مشروع ناقل",
    roomNameEn: "Naqel Project Office"
  },
  {
    id: DepartmentId.OPS_NINJA,
    nameAr: "مدير مشروع نينجا",
    nameEn: "Ninja Project Manager",
    prefix: "OP",
    roomNameAr: "مكتب مشروع نينجا",
    roomNameEn: "Ninja Project Office"
  }
];

export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAtvZC_Ztg8lVbOUaMl8f268RBnskq3qM0",
    authDomain: "zah123-cd263.firebaseapp.com",
    projectId: "zah123-cd263",
    storageBucket: "zah123-cd263.firebasestorage.app",
    messagingSenderId: "978446441946",
    appId: "1:978446441946:web:d3a1183239d86c81ecf4e3",
    databaseURL: "https://zah123-cd263-default-rtdb.firebaseio.com/"
};
