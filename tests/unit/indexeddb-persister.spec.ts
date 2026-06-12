import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIndexedDBPersister } from "@/lib/indexeddb-persister";
import { set, get, del } from "idb-keyval";

vi.mock("idb-keyval", () => ({
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
}));

describe("IndexedDB Persister", () => {
  const mockClient: any = {
    timestamp: 123456789,
    clientState: {
      mutations: [],
      queries: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve criar um persister com os métodos corretos", () => {
    const persister = createIndexedDBPersister();
    expect(persister.persistClient).toBeTypeOf("function");
    expect(persister.restoreClient).toBeTypeOf("function");
    expect(persister.removeClient).toBeTypeOf("function");
  });

  it("deve chamar set do idb-keyval ao persistir o cliente", async () => {
    const persister = createIndexedDBPersister("customKey");
    await persister.persistClient(mockClient);
    expect(set).toHaveBeenCalledWith("customKey", mockClient);
  });

  it("deve chamar get do idb-keyval ao restaurar o cliente", async () => {
    vi.mocked(get).mockResolvedValue(mockClient);
    const persister = createIndexedDBPersister("customKey");
    const client = await persister.restoreClient();
    
    expect(get).toHaveBeenCalledWith("customKey");
    expect(client).toEqual(mockClient);
  });

  it("deve chamar del do idb-keyval ao remover o cliente", async () => {
    const persister = createIndexedDBPersister("customKey");
    await persister.removeClient();
    expect(del).toHaveBeenCalledWith("customKey");
  });

  it("deve lidar com erros ao persistir silenciosamente no console", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(set).mockRejectedValue(new Error("IndexedDB write failed"));
    
    const persister = createIndexedDBPersister();
    await persister.persistClient(mockClient);
    
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
