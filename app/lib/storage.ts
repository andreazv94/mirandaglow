import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SkinProfile } from './types';

const PROFILE_KEY='mirandaglow.profile.v1';
const ROUTINE_KEY='mirandaglow.routine.v1';
export async function saveProfile(profile:SkinProfile){await AsyncStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}
export async function loadProfile():Promise<SkinProfile|null>{const raw=await AsyncStorage.getItem(PROFILE_KEY);return raw?JSON.parse(raw):null;}
export async function saveRoutine(routine:unknown){await AsyncStorage.setItem(ROUTINE_KEY,JSON.stringify(routine));}
export async function loadRoutine<T>():Promise<T|null>{const raw=await AsyncStorage.getItem(ROUTINE_KEY);return raw?JSON.parse(raw):null;}
