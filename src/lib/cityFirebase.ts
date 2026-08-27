import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { FirebaseStorageTypes } from "@react-native-firebase/storage";
import { Functions } from "@react-native-firebase/functions";

let _app: any = null;
let _db: FirebaseFirestoreTypes.Module | null = null;
let _auth: FirebaseAuthTypes.Module | null = null;
let _storage: FirebaseStorageTypes.Module | null = null;
let _functions: Functions | null = null;

export const setCityFirebaseInstances = (
  app: any,
  db: FirebaseFirestoreTypes.Module,
  auth: FirebaseAuthTypes.Module,
  storage: FirebaseStorageTypes.Module,
  functions: Functions
) => {
  _app = app;
  _db = db;
  _auth = auth;
  _storage = storage;
  _functions = functions;
};

export const clearCityFirebaseInstances = () => {
  _app = null;
  _db = null;
  _auth = null;
  _storage = null;
  _functions = null;
};

export const getCityApp = (): any => {
  if (!_app) throw new Error("[CityFirebase] No city selected.");
  return _app;
};

export const getCityDb = (): FirebaseFirestoreTypes.Module => {
  if (!_db) throw new Error("[CityFirebase] No city selected.");
  return _db;
};

export const getCityAuth = (): FirebaseAuthTypes.Module => {
  if (!_auth) throw new Error("[CityFirebase] No city selected.");
  return _auth;
};

export const getCityStorage = (): FirebaseStorageTypes.Module => {
  if (!_storage) throw new Error("[CityFirebase] No city selected.");
  return _storage;
};

export const getCityFunctions = (): Functions => {
  if (!_functions) throw new Error("[CityFirebase] No city selected.");
  return _functions;
};
