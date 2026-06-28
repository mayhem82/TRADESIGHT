import { createProject } from '../models/project.js';

const STORAGE_KEY = 'tradesight-current-project';

export function saveProject(project) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  return project;
}

export function loadProject() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createProject();

  try {
    return createProject(JSON.parse(raw));
  } catch {
    return createProject();
  }
}

export function clearProject() {
  window.localStorage.removeItem(STORAGE_KEY);
  return createProject();
}
