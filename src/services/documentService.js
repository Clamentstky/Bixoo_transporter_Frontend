import api from "./api";

const documentService = {
  getDocuments: async () => {
    const response = await api.get("/transporter/documents");
    return response;
  },

  getDocumentStatus: async () => {
    const response = await api.get("/transporter/documents/status");
    return response;
  },

  getDocument: async (type) => {
    const response = await api.get(`/transporter/documents/${type}`);
    return response;
  },

  uploadDocument: async (formData) => {
    const response = await api.post("/transporter/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }
};

export default documentService;
