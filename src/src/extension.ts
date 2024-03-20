import * as vscode from "vscode";
import { EMOJI_MENTION, subscribeToDocumentChanges } from "./diagnostics";

const COMMAND = "code-actions-sample.command";
let skillingChampion = vscode.window.createOutputChannel("skillingChampion");
export function activate(context: vscode.ExtensionContext) {
  // Example: Reading Window scoped configuration
  const skillingChampionEnabled = vscode.workspace
    .getConfiguration()
    .get("conf.skillingChampion.enable");
  const skillingChampionCreatorId = vscode.workspace
    .getConfiguration()
    .get("conf.skillingChampion.creatorId");

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
    vscode.languages.registerCodeActionsProvider("markdown", new Emojinfo(), {
      providedCodeActionKinds: Emojinfo.providedCodeActionKinds,
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND, () =>
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://unicode.org/emoji/charts-12.0/full-emoji-list.html"
        )
      )
    )
  );

  // if (vscode.window.activeTextEditor) {
  //   updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  // }
  // context.subscriptions.push(
  //   vscode.window.onDidChangeActiveTextEditor((editor) => {
  //     if (editor) {
  //       updateDiagnostics(editor.document, collection);
  //     }
  //   })
  // );
}

function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void {
  if (document) {
    collection.set(document.uri, [
      {
        code: "",
        message: "cannot assign twice to immutable variable `x`",
        range: new vscode.Range(
          new vscode.Position(3, 4),
          new vscode.Position(3, 10)
        ),
        severity: vscode.DiagnosticSeverity.Error,
        source: "",
        relatedInformation: [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(
              document.uri,
              new vscode.Range(
                new vscode.Position(1, 8),
                new vscode.Position(1, 9)
              )
            ),
            "first assignment to `x`"
          ),
        ],
      },
    ]);
  } else {
    collection.clear();
  }
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

    const replaceWithSmileyCatFix = this.createFix(document, range, "😺");

    const replaceWithSmileyFix = this.createFix(document, range, "😀");
    // Marking a single fix as `preferred` means that users can apply it with a
    // single keyboard shortcut using the `Auto Fix` command.
    replaceWithSmileyFix.isPreferred = true;

    const replaceWithSmileyHankyFix = this.createFix(document, range, "💩");

    const commandAction = this.createCommand();

    return [
      replaceWithSmileyCatFix,
      replaceWithSmileyFix,
      replaceWithSmileyHankyFix,
      commandAction,
    ];
  }

  private containsUrlToSupportedDomainWithoutCreatorId(
    document: vscode.TextDocument,
    range: vscode.Range
  ) {
    const regex = new RegExp(
      "((?!.*WT.mc_id=[A-Z]{1,3}-[A-Z]{1,3}-[0-9]{6,8})(?<Protocol>w+)://(?<Domain>social.technet.microsoft.com|azure.microsoft.com|techcommunity.microsoft.com|social.msdn.microsoft.com|devblogs.microsoft.com|developer.microsoft.com|channel9.msdn.com|gallery.technet.microsoft.com|cloudblogs.microsoft.com|technet.microsoft.com|docs.azure.cn|www.azure.cn|msdn.microsoft.com|blogs.msdn.microsoft.com|blogs.technet.microsoft.com|microsoft.com/handsonlabs)(?<Path>/?[w.?=%&=-@/$,]*))"
    );
    const start = range.start;
    const line = document.lineAt(start.line);
    const match = line.text.match(regex);
    if (match) {
      skillingChampion.appendLine(`Match: ${match}`);
    } else {
      skillingChampion.appendLine(line.text);
    }
    return match !== null;
  }

  private createFix(
    document: vscode.TextDocument,
    range: vscode.Range,
    emoji: string
  ): vscode.CodeAction {
    const fix = new vscode.CodeAction(
      `Convert to ${emoji}`,
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      new vscode.Range(range.start, range.start.translate(0, 2)),
      emoji
    );
    return fix;
  }

  private createCommand(): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Learn more...",
      vscode.CodeActionKind.Empty
    );
    action.command = {
      command: COMMAND,
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
    };
    return action;
  }
}

export class Emojinfo implements vscode.CodeActionProvider {
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
      .filter((diagnostic) => diagnostic.code === EMOJI_MENTION)
      .map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Learn more...",
      vscode.CodeActionKind.QuickFix
    );
    action.command = {
      command: COMMAND,
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}
