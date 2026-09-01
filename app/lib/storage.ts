import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SkinProfile, RoutineStep } from './types';
export type GeneratedRoutine={am:RoutineStep[];pm:RoutineStep[]};
export type RoutineState={completed:string[];lastCompletedDate?:string;streak:number};
const PROFILE_KEY='mirandaglow.profile.v1'; const ROUTINE_KEY='mirandaglow.routine.v1'; const STATE_KEY='mirandaglow.state.v1';
export async function saveProfile(profile:SkinProfile){await AsyncStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}
export async function loadProfile(){const raw=await AsyncStorage.getItem(PROFILE_KEY);return raw?JSON.parse(raw) as SkinProfile:null;}
export async function saveRoutine(routine:GeneratedRoutine){await AsyncStorage.setItem(ROUTINE_KEY,JSON.stringify(routine));}
export async function loadRoutine(){const raw=await AsyncStorage.getItem(ROUTINE_KEY);return raw?JSON.parse(raw) as GeneratedRoutine:null;}
export async function saveRoutineState(state:RoutineState){await AsyncStorage.setItem(STATE_KEY,JSON.stringify(state));}
export async function loadRoutineState():Promise<RoutineState>{const raw=await AsyncStorage.getItem(STATE_KEY);return raw?JSON.parse(raw):{completed:[],streak:0};}
export async function markStepCompleted(id:string){const state=await loadRoutineState();if(!state.completed.includes(id))state.completed=[...state.completed,id];await saveRoutineState(state);return state;}
export async function unmarkStepCompleted(id:string){const state=await loadRoutineState();state.completed=state.completed.filter(x=>x!==id);await saveRoutineState(state);return state;}
export async function resetDailyProgress(){const state=await loadRoutineState();state.completed=[];await saveRoutineState(state);return state;}
