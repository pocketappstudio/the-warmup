import Foundation
import Capacitor
import WidgetKit

@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise)
    ]

    @objc func set(_ call: CAPPluginCall) {
        if let d = UserDefaults(suiteName: "group.com.pocketappstudio.thewarmup") {
            d.set(call.getString("verse") ?? "", forKey: "verse")
            d.set(call.getString("ref") ?? "", forKey: "ref")
            d.set(call.getString("title") ?? "", forKey: "title")
            d.set(call.getString("day") ?? "", forKey: "day")
            d.set(call.getInt("streak") ?? 0, forKey: "streak")
        }
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}
