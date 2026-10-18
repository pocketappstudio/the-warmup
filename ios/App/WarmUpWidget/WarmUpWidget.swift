import WidgetKit
import SwiftUI

private let appGroup = "group.com.pocketappstudio.thewarmup"

struct WarmUpEntry: TimelineEntry {
    let date: Date
    let verse: String
    let ref: String
    let title: String
    let streak: Int
}

private func dayString(_ d: Date) -> String {
    let f = DateFormatter()
    f.calendar = Calendar(identifier: .gregorian)
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "yyyy-MM-dd"
    return f.string(from: d)
}

struct Provider: TimelineProvider {
    private let fallbackVerse = "Let’s not be weary in doing good, for we will reap in due season if we don’t give up."
    private let fallbackRef = "Gal 6:9 WEB"

    func placeholder(in context: Context) -> WarmUpEntry {
        WarmUpEntry(date: Date(), verse: fallbackVerse, ref: fallbackRef, title: "Own One Mistake", streak: 12)
    }

    func getSnapshot(in context: Context, completion: @escaping (WarmUpEntry) -> Void) {
        completion(load())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WarmUpEntry>) -> Void) {
        let now = Date()
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Calendar.current.startOfDay(for: now)) ?? now.addingTimeInterval(3600)
        completion(Timeline(entries: [load()], policy: .after(tomorrow)))
    }

    private func load() -> WarmUpEntry {
        let d = UserDefaults(suiteName: appGroup)
        let day = d?.string(forKey: "day") ?? ""
        let now = Date()
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: now) ?? now
        let isToday = day == dayString(now)
        let recent = isToday || day == dayString(yesterday)
        let verse = d?.string(forKey: "verse") ?? ""
        let ref = d?.string(forKey: "ref") ?? ""
        let title = d?.string(forKey: "title") ?? ""
        return WarmUpEntry(
            date: now,
            verse: verse.isEmpty ? fallbackVerse : verse,
            ref: verse.isEmpty ? fallbackRef : ref,
            title: isToday && !title.isEmpty ? title : "Open for today",
            streak: recent ? (d?.integer(forKey: "streak") ?? 0) : 0
        )
    }
}

private let cream = Color(red: 0.965, green: 0.945, blue: 0.91)
private let rust = Color(red: 0.788, green: 0.51, blue: 0.29)
private let muted = Color(red: 0.81, green: 0.78, blue: 0.71)
private let bg = LinearGradient(colors: [Color(red: 0.2, green: 0.28, blue: 0.24), Color(red: 0.133, green: 0.176, blue: 0.149)], startPoint: .topLeading, endPoint: .bottomTrailing)

extension View {
    @ViewBuilder func widgetBg() -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) { bg }
        } else {
            self.background(bg)
        }
    }
}

struct StreakView: View {
    let streak: Int
    let big: Bool
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "flame.fill").foregroundColor(rust).font(.system(size: big ? 20 : 15))
            Text("\(streak)").font(.system(size: big ? 32 : 22, weight: .bold)).foregroundColor(cream)
            Text(streak == 1 ? "day" : "days").font(.system(size: 11, weight: .semibold)).foregroundColor(muted)
        }
    }
}

struct WarmUpWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: WarmUpEntry

    var body: some View {
        Group {
            if family == .systemMedium { medium } else { small }
        }
        .widgetBg()
    }

    private var small: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.title.uppercased()).font(.system(size: 9.5, weight: .bold)).foregroundColor(rust).lineLimit(1)
            Text(entry.verse).font(.system(size: 12, design: .serif).italic()).foregroundColor(cream).lineLimit(5).minimumScaleFactor(0.8)
            Text(entry.ref).font(.system(size: 9.5, weight: .semibold)).foregroundColor(muted)
            Spacer(minLength: 0)
            StreakView(streak: entry.streak, big: false)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    private var medium: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(alignment: .leading, spacing: 5) {
                Text("VERSE").font(.system(size: 9.5, weight: .bold)).foregroundColor(rust)
                Text(entry.verse).font(.system(size: 13, design: .serif).italic()).foregroundColor(cream).lineLimit(5).minimumScaleFactor(0.8)
                Text(entry.ref).font(.system(size: 9.5, weight: .semibold)).foregroundColor(muted)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            Rectangle().fill(Color.white.opacity(0.14)).frame(width: 1)
            VStack(alignment: .leading, spacing: 5) {
                Text("TODAY").font(.system(size: 9.5, weight: .bold)).foregroundColor(rust)
                Text(entry.title).font(.system(size: 15, weight: .bold, design: .serif)).foregroundColor(cream).lineLimit(3)
                Spacer(minLength: 0)
                StreakView(streak: entry.streak, big: true)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

@main
struct WarmUpWidget: Widget {
    let kind = "WarmUpWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WarmUpWidgetView(entry: entry)
        }
        .configurationDisplayName("The WarmUp")
        .description("Verse, assignment and streak.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
