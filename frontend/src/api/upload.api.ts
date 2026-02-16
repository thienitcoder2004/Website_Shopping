import axiosInstance from "./axios.config";

export const uploadFiles = (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return axiosInstance.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
