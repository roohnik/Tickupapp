import { makeAutoObservable } from "mobx";
import { Board } from "../types";
import { safeEmit } from "@/utils/socketActions";

export class BoardStore {
  boards: Board[] = [];
  boardToEdit: Board | null = null;
  defaultProjectId: string | "all" = "all";

  constructor() {
    makeAutoObservable(this);
  }

  setBoards = (list: Board[]) => {
    this.boards = list;
  };

  // addBoard = (board: Board) => {
  //   this.boards.push(board);
  // };
  // ✅ Add board only if it doesn’t exist yet
  addBoard = (board: Board) => {
    const exists = this.boards.some((b) => b.id === board.id);
    if (!exists) {
      this.boards.push(board);
    } else {
      this.updateBoard(board);
    }
  };

  updateBoard = (updated: Board) => {
    this.boards = this.boards.map((b) => (b.id === updated.id ? updated : b));
    if (this.boardToEdit?.id === updated.id) this.boardToEdit = updated;
  };

  deleteBoard = (id: string) => {
    this.boards = this.boards.filter((b) => b.id !== id);
    if (this.boardToEdit?.id === id) this.boardToEdit = null;
  };

  // ✅ Handle pinned event specifically
  togglePinned = (updated: Board) => {
    this.updateBoard(updated);
  };

  submitBoard = (data: Board) => {
    this.updateBoard(data);
  };

  setBoardToEdit = (board: Board | null) => {
    this.boardToEdit = board;
  };
  fetchBoards = async (workspaceId: string) => {
    const res = await safeEmit("boards:list", { workspaceId });
    if (res.ok) this.setBoards(res.boards);
  };
}
