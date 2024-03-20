import * as vscode from "vscode";
import {
  SKILLING_CHAMPION_MENTION,
  SKILLING_CHAMPION_REGEX,
  subscribeToDocumentChanges,
} from "./diagnostics";

const COMMAND = "skilling-champion.learnMore";

let skillingChampion = vscode.window.createOutputChannel("skillingChampion");
export function activate(context: vscode.ExtensionContext) {
  // Example: Reading Window scoped configuration
  const skillingChampionEnabled = vscode.workspace
    .getConfiguration()
    .get("skillingChampion.enable");
  const skillingChampionCreatorId = vscode.workspace
    .getConfiguration()
    .get("skillingChampion.creatorId");

  skillingChampion.appendLine(
    `skillingChampionEnabled ${skillingChampionEnabled} with creatorId ${skillingChampionCreatorId}`
  );
  if (skillingChampionEnabled) {
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        "markdown",
        new SkillingChampionizer(),
        {
          providedCodeActionKinds: SkillingChampionizer.providedCodeActionKinds,
        }
      )
    );
  }

  const skillingChampionDiagnostics =
    vscode.languages.createDiagnosticCollection("skillingChampion");
  context.subscriptions.push(skillingChampionDiagnostics);

  subscribeToDocumentChanges(context, skillingChampionDiagnostics);

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "markdown",
      new SkillingChampionInfo(),
      {
        providedCodeActionKinds: SkillingChampionInfo.providedCodeActionKinds,
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND, () =>
      vscode.env.openExternal(vscode.Uri.parse("https://mvp.microsoft.com/"))
    )
  );
}

/**
 * Provides code actions for converting a URL without skilling champion creator ID
 * to a ling that does contain the creator ID.
 */
export class SkillingChampionizer implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] | undefined {
    if (!this.containsUrlToSupportedDomainWithoutCreatorId(document, range)) {
      return;
    }

    const skillingChampionCreatorId = vscode.workspace
      .getConfiguration()
      .get("skillingChampion.creatorId") as string | undefined;

    const actions = [];

    if (skillingChampionCreatorId) {
      const ids = skillingChampionCreatorId.split(";");
      ids.forEach((id) => {
        actions.push(this.createFix(document, range, id));
      });
    }

    const commandAction = this.createCommand();
    actions.push(commandAction);

    return actions.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  }

  private containsUrlToSupportedDomainWithoutCreatorId(
    document: vscode.TextDocument,
    range: vscode.Range
  ) {
    const start = range.start;
    const line = document.lineAt(start.line);
    const match = line.text.match(SKILLING_CHAMPION_REGEX);
    return match !== null;
  }

  private createFix(
    document: vscode.TextDocument,
    range: vscode.Range,
    creatorId: string
  ): vscode.CodeAction {
    const fix = new vscode.CodeAction(
      `Add CreatorID ${creatorId}`,
      vscode.CodeActionKind.QuickFix
    );

    const rangeStart = range.start;
    const line = document.lineAt(rangeStart.line);
    const matches = line.text.match(SKILLING_CHAMPION_REGEX);
    if (matches) {
      const match = matches[0];
      const replacement =
        match.indexOf("?") >= 0
          ? `${match}&WT.mc_id=${creatorId}`
          : `${match}?WT.mc_id=${creatorId}`;
      const matchIndex = line.text.indexOf(match);
      const matchRange = new vscode.Range(
        rangeStart.line,
        matchIndex,
        rangeStart.line,
        matchIndex + match.length
      );
      fix.edit = new vscode.WorkspaceEdit();
      fix.edit.replace(document.uri, matchRange, replacement);
    }

    return fix;
  }

  private createCommand(): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Microsoft MVP Program",
      vscode.CodeActionKind.Empty
    );
    action.command = {
      command: COMMAND,
      title: "Microsoft MVP Program",
      tooltip: "Learn more about the Microsoft MVP Program.",
    };
    return action;
  }
}

export class SkillingChampionInfo implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    // for each diagnostic entry that has the matching `code`, create a code action command
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === SKILLING_CHAMPION_MENTION)
      .map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Microsoft MVP Program",
      vscode.CodeActionKind.QuickFix
    );
    action.command = {
      command: COMMAND,
      title: "Microsoft MVP Program",
      tooltip: "Learn more about the Microsoft MVP Program.",
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}
