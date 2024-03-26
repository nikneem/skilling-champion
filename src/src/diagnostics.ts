import * as vscode from "vscode";
export const SKILLING_CHAMPION_MENTION = "skillingchampion_mention";
export const SKILLING_CHAMPION_REGEX =
  /((?!.*WT.mc_id=[A-Z0-9]{1,5}-[A-Z]{1,3}-[0-9]{6,8})(?<Protocol>\w{2,6}):\/\/(?<Domain>social.technet.microsoft.com|docs.microsoft.com|learn.microsoft.com|azure.microsoft.com|techcommunity.microsoft.com|social.msdn.microsoft.com|devblogs.microsoft.com|developer.microsoft.com|channel9.msdn.com|gallery.technet.microsoft.com|cloudblogs.microsoft.com|technet.microsoft.com|docs.azure.cn|www.azure.cn|msdn.microsoft.com|blogs.msdn.microsoft.com|blogs.technet.microsoft.com|microsoft.com\/handsonlabs|csc.docs.microsoft.com)(?<Path>\/?[\w.?=%&=\-@\/$,]*))/;

/**
 * Analyzes the text document for problems.
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param emojiDiagnostics diagnostic collection
 */
export function refreshDiagnostics(
  doc: vscode.TextDocument,
  emojiDiagnostics: vscode.DiagnosticCollection
): void {
  const diagnostics: vscode.Diagnostic[] = [];

  for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
    const lineOfText = doc.lineAt(lineIndex);
    const matches = lineOfText.text.match(SKILLING_CHAMPION_REGEX);
    if (matches) {
      diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, matches));
    }
  }

  emojiDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(
  doc: vscode.TextDocument,
  lineOfText: vscode.TextLine,
  lineIndex: number,
  matches: RegExpMatchArray
): vscode.Diagnostic {
  const match = matches[0];
  const index = lineOfText.text.indexOf(match);

  // create range that represents, where in the document the word is
  const range = new vscode.Range(
    lineIndex,
    index,
    lineIndex,
    index + match.length
  );

  const diagnostic = new vscode.Diagnostic(
    range,
    "Add your Skilling Champion Creator ID to the URL.",
    vscode.DiagnosticSeverity.Warning
  );
  diagnostic.code = SKILLING_CHAMPION_MENTION;
  return diagnostic;
}

export function subscribeToDocumentChanges(
  context: vscode.ExtensionContext,
  emojiDiagnostics: vscode.DiagnosticCollection
): void {
  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(
      vscode.window.activeTextEditor.document,
      emojiDiagnostics
    );
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refreshDiagnostics(editor.document, emojiDiagnostics);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) =>
      refreshDiagnostics(e.document, emojiDiagnostics)
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) =>
      emojiDiagnostics.delete(doc.uri)
    )
  );
}
