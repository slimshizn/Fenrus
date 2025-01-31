using System.Text.Json.Serialization;
using Fenrus.Models;

namespace Fenrus.Services;

/// <summary>
/// Service for Apps
/// </summary>
public class AppService
{
    private static readonly Dictionary<string, FenrusApp> _Apps = new ();

    /// <summary>
    /// Gets a copy of the app dictionary
    /// </summary>
    public static Dictionary<string, FenrusApp> Apps => _Apps.ToDictionary(x => x.Key, x => x.Value);

    /// <summary>
    /// Initializes the apps in the system
    /// </summary>
    public static void Initialize()
    {
        _Apps.Clear();
        LoadApps(DirectoryHelper.GetSmartAppsDirectory(), true);
        LoadApps(DirectoryHelper.GetBasicAppsDirectory(), false);
    }

    /// <summary>
    /// Load apps from a directory
    /// </summary>
    /// <param name="dir">the directory to load apps from</param>
    /// <param name="smartApps">if these apps are smart or not</param>
    private static void LoadApps(string dir, bool smartApps)
    {
        var options = new JsonSerializerOptions();
        options.PropertyNameCaseInsensitive = true;
        options.AllowTrailingCommas = true;
        options.Converters.Add(new ItemSizeConverter());
        options.Converters.Add(new JsonStringEnumConverter());
        foreach (var file in new DirectoryInfo(dir).GetFiles("app.json", SearchOption.AllDirectories))
        {
            try
            {
                var json = File.ReadAllText(file.FullName);
                var app = JsonSerializer.Deserialize<FenrusApp>(json, options);
                if (string.IsNullOrWhiteSpace(app.Name))
                    continue;
                if (_Apps.ContainsKey(app.Name))
                    continue;
                app.IsSmart = smartApps;
                app.FullPath = file.Directory?.FullName ?? string.Empty;
                if (string.IsNullOrEmpty(app.Icon))
                    app.Icon = "icon.png"; // default image
                if(string.IsNullOrWhiteSpace(app.DefaultUrl))
                    app.DefaultUrl = $"http://{app.Name.ToLower().Replace(" ", "-")}.lan/";
                _Apps.Add(app.Name, app);
            }
            catch (Exception ex)
            {
                Logger.ELog($"Failed parsing app '{file.FullName}': {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Gets an app by its name
    /// For an unknown app, a basic app instance will be returned
    /// </summary>
    /// <param name="appName">the app name</param>
    /// <returns>a app instance</returns>
    public static FenrusApp GetByName(string appName)
    {
        if (_Apps.ContainsKey(appName))
            return _Apps[appName];
        // we dont like nulls
        return new FenrusApp()
        {
            Name = appName
        };
    }
}

class ItemSizeConverter : JsonConverter<ItemSize>
{
    public override ItemSize Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        value = value.Replace("-", "");
        return Enum.Parse<ItemSize>(value, ignoreCase: true);
    }

    public override void Write(Utf8JsonWriter writer, ItemSize value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}