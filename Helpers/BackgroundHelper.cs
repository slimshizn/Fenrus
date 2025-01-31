namespace Fenrus.Helpers;

/// <summary>
/// Helper class for backgrounds
/// </summary>
public class BackgroundHelper
{
    
    /// <summary>
    /// Gets the names for the background
    /// </summary>
    /// <param name="translator">The translator to use for translations</param>
    /// <param name="hasCustomBackground">if the user has a custom background image available as an option</param>
    /// <returns>the background names</returns>
    public static string[] GetBackgroundNames(Translator translator, bool hasCustomBackground)
    {
        return new []
        {
            hasCustomBackground ? translator.Instant("Labels.CurrentImage") : null,
            translator.Instant("Labels.ChooseImage"),
            translator.Instant("Labels.Default"),
            translator.Instant("Labels.DefaultStatic"),
            translator.Instant("Labels.ColorBackground"),
            "Vanta Birds",
            "Vanta Cells",
            "Vanta Dots",
            "Vanta Fog",
            "Vanta Net",
            "Vanta Waves",
        }.Where(x => x != null).ToArray();
    }

    /// <summary>
    /// Gets the values for the background
    /// </summary>
    /// <param name="hasCustomBackground">if the user has a custom background image available as an option</param>
    /// <returns>the background values</returns>
    public static string[] GetBackgroundValues(bool hasCustomBackground)
    {
        return new []
        {
            hasCustomBackground ? "image.js" : string.Empty,
            "image-picker",
            "default.js",
            "default.static.js",
            "color.js",
            "vanta.birds.js",
            "vanta.cells.js",
            "vanta.dots.js",
            "vanta.fog.js",
            "vanta.net.js",
            "vanta.waves.js"
        }.Where(x => x != string.Empty).ToArray();
    }
}