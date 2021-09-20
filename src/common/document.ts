import vscode from "vscode";

export enum Brackets {
  ROUND = "()",
  BOX = "[]",
  CURLY = "{}",
}

export class TextDocumentUtils {
  private document: vscode.TextDocument;
  private readonly illegal: vscode.Position;

  constructor(document: vscode.TextDocument) {
    this.document = document;
    this.illegal = document.validatePosition(
      new vscode.Position(Infinity, Infinity)
    );
  }

  public CharAt = (offset: number): string => {
    return this.document.getText(
      new vscode.Range(
        this.document.positionAt(offset),
        this.document.positionAt(offset + 1)
      )
    );
  };

  public outOfRange = (offset: number) => {
    return this.document.positionAt(offset).isEqual(this.illegal);
  };

  public growBracketsRange(
    positionOrRange: vscode.Position | vscode.Range,
    brackets: Brackets
  ): vscode.Range | null {
    let start: number;
    let end: number;
    if (positionOrRange instanceof vscode.Position) {
      start = this.document.offsetAt(positionOrRange);
      end = this.document.offsetAt(positionOrRange);
    } else {
      start = this.document.offsetAt(positionOrRange.start);
      end = this.document.offsetAt(positionOrRange.end);
    }
    let growStart;
    let growEnd;
    const startOfDocument = this.document.offsetAt(new vscode.Position(0, 0));
    const endOfDocument = this.document.offsetAt(
      new vscode.Position(Infinity, Infinity)
    );
    let bracketsStack: string[] = [];
    const leftBrackets = brackets[0];
    const rightBrackets = brackets[1];
    for (let i = start - 1; i >= startOfDocument; i--) {
      if (this.CharAt(i) === rightBrackets) {
        bracketsStack.push(brackets);
      } else if (this.CharAt(i) === leftBrackets) {
        if (bracketsStack.length === 0) {
          growStart = i;
          break;
        } else {
          bracketsStack.pop();
        }
      }
    }
    if (!growStart) {
      return null;
    }
    bracketsStack = [];
    for (let i = end; i <= endOfDocument; i++) {
      if (this.CharAt(i) === leftBrackets) {
        bracketsStack.push(brackets);
      } else if (this.CharAt(i) === rightBrackets) {
        if (bracketsStack.length === 0) {
          growEnd = i;
          break;
        } else {
          bracketsStack.pop();
        }
      }
    }
    if (!growEnd) {
      return null;
    }
    return new vscode.Range(
      this.document.positionAt(growStart),
      this.document.positionAt(growEnd + 1)
    );
  }
}
