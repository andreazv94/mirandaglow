import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY='mirandaglow.shelf.v1';
export async function loadShelf():Promise<string[]>{const raw=await AsyncStorage.getItem(KEY);return raw?JSON.parse(raw):[];}
export async function saveShelf(ids:string[]){await AsyncStorage.setItem(KEY,JSON.stringify([...new Set(ids)]));}
export async function addToShelf(id:string){const ids=await loadShelf();if(!ids.includes(id))ids.push(id);await saveShelf(ids);return ids;}
export async function removeFromShelf(id:string){const ids=(await loadShelf()).filter(x=>x!==id);await saveShelf(ids);return ids;}
