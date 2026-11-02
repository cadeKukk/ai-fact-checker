import SwiftUI

struct SourcesView: View {
  @Environment(AppStore.self) private var store
  @State private var query = ""
  @State private var type = "all"
  @State private var selected: Source?
  @State private var feedback = false
  private var sources: [Source] {
    store.catalog.sources.filter {
      (type == "all" || $0.type == type)
        && (query.isEmpty || $0.title.localizedCaseInsensitiveContains(query)
          || $0.url.localizedCaseInsensitiveContains(query))
    }
  }
  var body: some View {
    Page {
      PageHeader(
        kicker: "The evidence", title: "Sources",
        subtitle: "Every claim should lead somewhere. Explore the sources behind the facts.")
      Card(color: AppTheme.accent.opacity(0.06), border: AppTheme.accent.opacity(0.2)) {
        HStack(alignment: .top, spacing: 12) {
          Image(systemName: "checkmark.shield").foregroundStyle(AppTheme.light)
          Text(
            "Official documentation, research papers, repositories, and reporting. Check the original source and its date when evaluating a claim."
          ).font(AppTheme.font(14)).foregroundStyle(AppTheme.soft)
        }
      }
      SearchField(text: $query, placeholder: "Search sources…")
      FilterChips(
        values: [
          "all", "officialDocs", "github", "researchPaper", "blogPost", "newsArticle",
          "apiReference",
        ], selected: $type, labels: Labels.sources)
      HStack {
        Text("\(sources.count) sources").font(AppTheme.font(12)).foregroundStyle(AppTheme.muted)
        Spacer()
        Button("Send feedback") { feedback = true }.font(AppTheme.font(12, .medium))
      }
      if sources.isEmpty { EmptyResults() }
      LazyVStack(spacing: 10) {
        ForEach(sources) { source in
          Button {
            selected = source
          } label: {
            Card {
              HStack(alignment: .top, spacing: 12) {
                IconTile(
                  icon: source.type == "github"
                    ? "chevron.left.forwardslash.chevron.right"
                    : source.type == "researchPaper" ? "book" : "doc.text")
                VStack(alignment: .leading, spacing: 7) {
                  Text(source.title).font(AppTheme.font(15, .semibold))
                  Text(source.typeName).font(AppTheme.font(11)).foregroundStyle(AppTheme.light)
                  Text(URL(string: source.url)?.host ?? source.url).font(AppTheme.font(11))
                    .foregroundStyle(AppTheme.muted).lineLimit(1)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right").font(.system(size: 12)).foregroundStyle(
                  AppTheme.muted)
              }
            }
          }.buttonStyle(.plain)
        }
      }
      NavigationLink(value: AppRoute.about) {
        Label("About, privacy & app information", systemImage: "info.circle").font(
          AppTheme.font(14))
      }
    }.sheet(item: $selected) { source in
      NavigationStack {
        Page {
          PageHeader(
            kicker: source.typeName, title: source.title,
            subtitle: URL(string: source.url)?.host ?? "Source")
          Text("Accessed \(source.dateAccessed)").foregroundStyle(AppTheme.muted)
          if let url = URL(string: source.url) {
            Link(destination: url) {
              Label("Read original source", systemImage: "arrow.up.right.square").font(
                AppTheme.font(18, .semibold))
            }
            ShareLink(item: url) { Label("Share source", systemImage: "square.and.arrow.up") }
          }
        }.navigationBarTitleDisplayMode(.inline).toolbar {
          ToolbarItem(placement: .topBarTrailing) { Button("Done") { selected = nil } }
        }
      }.preferredColorScheme(.dark)
    }.sheet(isPresented: $feedback) { FeedbackView().preferredColorScheme(.dark) }
  }
}
struct FeedbackView: View {
  @Environment(\.dismiss) private var dismiss
  @State private var message = ""
  @State private var sending = false
  @State private var status: String?
  @State private var sent = false
  var body: some View {
    NavigationStack {
      Page {
        PageHeader(
          kicker: "Help improve the facts", title: "Send feedback",
          subtitle: "Found an error or a missing source? Let us know.")
        TextEditor(text: $message).frame(minHeight: 220).scrollContentBackground(.hidden).padding(
          12
        ).background(AppTheme.surface, in: RoundedRectangle(cornerRadius: 10)).accessibilityLabel(
          "Feedback message")
        Text(
          "Your message is sent to the app’s developer through the AI Fact Checker website. Include a source link if you’re suggesting a correction."
        ).font(AppTheme.font(12)).foregroundStyle(AppTheme.muted)
        if let status {
          Text(status).foregroundStyle(sent ? .green : .orange).font(AppTheme.font(14))
            .accessibilityLabel(status)
        }
        PrimaryButton(
          title: sending ? "Sending…" : sent ? "Feedback sent" : "Send feedback",
          icon: sent ? "checkmark" : "paperplane"
        ) { Task { await send() } }.disabled(
          sending || sent || message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            || message.count > 12_000)
        Text("\(message.count) / 12,000 characters").font(AppTheme.font(11)).foregroundStyle(
          AppTheme.muted)
      }.navigationBarTitleDisplayMode(.inline).toolbar {
        ToolbarItem(placement: .topBarTrailing) { Button("Done") { dismiss() } }
      }
    }
  }
  private func send() async {
    sending = true
    status = nil
    defer { sending = false }
    do {
      var request = URLRequest(
        url: URL(string: "https://web-tau-peach-63.vercel.app/api/feedback")!)
      request.httpMethod = "POST"
      request.timeoutInterval = 30
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = try JSONEncoder().encode([
        "message": message.trimmingCharacters(in: .whitespacesAndNewlines)
      ])
      let (data, response) = try await URLSession.shared.data(for: request)
      guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
        let error =
          (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
        status = error ?? "Could not send feedback. Please try again."
        return
      }
      sent = true
      status = "Thank you — your feedback was sent."
    } catch {
      status =
        "You may be offline. Your message is still here; try sending it again when connected."
    }
  }
}
struct AboutView: View {
  @Environment(AppStore.self) private var store
  @State private var reset = false
  var body: some View {
    Page {
      PageHeader(
        kicker: "About", title: "AI Fact Checker",
        subtitle: "Verified information. Better understanding.")
      ReferenceText(
        text:
          "Built by Cade Kukk in collaboration with Dr. Blackwood and Professor Dolence at Longwood University."
      )
      Card {
        VStack(spacing: 12) {
          SpecRow(label: "Content version", value: store.catalog.version)
          SpecRow(label: "Updated", value: store.catalog.lastUpdated)
          SpecRow(label: "Data snapshot", value: store.catalog.dataSnapshot)
        }
      }
      SectionTitle(text: "Privacy")
      Text(
        "Your course progress, quiz totals, and model selections are stored on this device. This app does not require an account and contains no advertising or analytics SDKs. Lessons and the reference catalog work offline. If you send feedback, the message you choose to submit is sent to the developer through the website’s feedback service. Opening an external source uses your browser and is subject to that website’s privacy practices."
      ).font(AppTheme.font(14)).foregroundStyle(AppTheme.soft)
      SectionTitle(text: "Content & sources")
      Text(
        "The iOS catalog mirrors the web app’s dated content snapshot. AI information changes quickly. Follow the cited sources to confirm current details. Educational illustrations simplify the underlying systems; comparison ratings are editorial assessments."
      ).font(AppTheme.font(14)).foregroundStyle(AppTheme.soft)
      Link("Visit the web app", destination: URL(string: "https://web-tau-peach-63.vercel.app")!)
      DisclosureGroup("Open-source acknowledgments") {
        Text(
          "Outfit by Rodrigo Fuenzalida — SIL Open Font License 1.1. Educational illustrations use React and Lucide under the MIT license, and Tailwind CSS under the MIT license. License texts are bundled with the app."
        ).font(AppTheme.font(12)).foregroundStyle(AppTheme.muted).padding(.top, 8)
      }
      Button("Reset course progress and quiz statistics", role: .destructive) { reset = true }.font(
        AppTheme.font(14))
    }.navigationTitle("About & privacy").confirmationDialog(
      "Reset your learning progress?", isPresented: $reset, titleVisibility: .visible
    ) {
      Button("Reset progress", role: .destructive) { store.resetProgress() }
    } message: {
      Text("This clears course completion and lifetime quiz statistics on this device.")
    }
  }
}
