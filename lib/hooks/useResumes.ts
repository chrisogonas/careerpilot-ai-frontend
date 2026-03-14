"use client";

import { useCallback } from "react";
import { apiClient } from "@/lib/utils/api";
import type {
  Resume,
  CreateResumePayload,
  UpdateResumePayload,
  ResumeUploadPayload,
  ResumeUploadResponse,
  ResumeFileUploadResponse,
} from "@/lib/types";

export interface UseResumesReturn {
  getResumes: () => Promise<Resume[]>;
  getResume: (id: string) => Promise<Resume>;
  createResume: (payload: CreateResumePayload) => Promise<Resume>;
  updateResume: (id: string, payload: UpdateResumePayload) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  setDefaultResume: (id: string) => Promise<Resume>;
  duplicateResume: (resumeId: string, newTitle: string) => Promise<Resume>;
  uploadResume: (payload: ResumeUploadPayload) => Promise<ResumeUploadResponse>;
  uploadResumeFile: (file: File) => Promise<ResumeFileUploadResponse>;
}

export function useResumesApi(
  onResumesChanged?: (updater: (prev: Resume[]) => Resume[]) => void
): UseResumesReturn {
  const getResumes = useCallback(async (): Promise<Resume[]> => {
    const fetchedResumes = await apiClient.getResumes();
    onResumesChanged?.(() => fetchedResumes);
    return fetchedResumes;
  }, [onResumesChanged]);

  const getResume = useCallback(async (id: string): Promise<Resume> => {
    return await apiClient.getResume(id);
  }, []);

  const createResume = useCallback(async (payload: CreateResumePayload): Promise<Resume> => {
    const newResume = await apiClient.createResume(payload);
    onResumesChanged?.((prev) => [...prev, newResume]);
    return newResume;
  }, [onResumesChanged]);

  const updateResume = useCallback(async (id: string, payload: UpdateResumePayload): Promise<Resume> => {
    const updatedResume = await apiClient.updateResume(id, payload);
    onResumesChanged?.((prev) => prev.map((r) => (r.id === id ? updatedResume : r)));
    return updatedResume;
  }, [onResumesChanged]);

  const deleteResume = useCallback(async (id: string): Promise<void> => {
    await apiClient.deleteResume(id);
    onResumesChanged?.((prev) => prev.filter((r) => r.id !== id));
  }, [onResumesChanged]);

  const setDefaultResume = useCallback(async (id: string): Promise<Resume> => {
    const updatedResume = await apiClient.setDefaultResume(id);
    onResumesChanged?.((prev) => prev.map((r) => ({ ...r, is_default: r.id === id })));
    return updatedResume;
  }, [onResumesChanged]);

  const duplicateResume = useCallback(async (resumeId: string, newTitle: string): Promise<Resume> => {
    const duplicatedResume = await apiClient.duplicateResume(resumeId, newTitle);
    onResumesChanged?.((prev) => [...prev, duplicatedResume]);
    return duplicatedResume;
  }, [onResumesChanged]);

  const uploadResume = useCallback(async (payload: ResumeUploadPayload): Promise<ResumeUploadResponse> => {
    return await apiClient.uploadResume(payload);
  }, []);

  const uploadResumeFile = useCallback(async (file: File): Promise<ResumeFileUploadResponse> => {
    return await apiClient.uploadResumeFile(file);
  }, []);

  return {
    getResumes,
    getResume,
    createResume,
    updateResume,
    deleteResume,
    setDefaultResume,
    duplicateResume,
    uploadResume,
    uploadResumeFile,
  };
}
