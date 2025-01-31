using Fenrus.Models;
using Microsoft.AspNetCore.Components;

namespace Fenrus.Components;

/// <summary>
/// Search component used on dashboard
/// </summary>
public partial class SearchComponent
{
    /// <summary>
    /// Gets or sets the user settings
    /// </summary>
    [Parameter] public UserSettings Settings { get; set; }
    
    /// <summary>
    /// Gets or sets the translator to use
    /// </summary>
    [Parameter] public Translator Translator { get; set; }
    
    /// <summary>
    /// Gets or sets if the search should be shown
    /// </summary>
    [Parameter] public bool ShowSearch { get; set; }

    private List<SearchEngine> _SystemSearchEngines = new();

    /// <summary>
    /// Gets or sets the system search engines
    /// </summary>
    [Parameter] public List<SearchEngine> SystemSearchEngines
    {
        get => _SystemSearchEngines;
        set => _SystemSearchEngines = value ?? new();
    }

    private List<SearchEngine> SearchEngines;

    private SearchEngine Default;

    protected override void OnInitialized()
    {
        List<Models.SearchEngine> userSearchEngines =
            Settings.UserUid == Globals.GuestDashbardUid || Settings.UserUid == Guid.Empty
                ? new()
                : new SearchEngineService().GetAllForUser(Settings.UserUid);
        SearchEngines = userSearchEngines.Union(SystemSearchEngines)
            .Select(x => new SearchEngine()
            {
                IsDefault = x.IsDefault,
                Enabled = x.Enabled,
                Name = x.Name,
                Shortcut = x.Shortcut,
                Uid = x.Uid,
                Url = x.Url,
                IsSystem = x.IsSystem,
                Icon = string.IsNullOrEmpty(x.Icon) ? "/favicon" : "/fimage/" + x.Icon.Substring(x.Icon.LastIndexOf("/") + 1)
            }).ToList();
        if (SearchEngines.Any(x => x.IsDefault) == false)
            SearchEngines[0].IsDefault = true;
        foreach (var se in SearchEngines.Where(x => x.IsDefault).Skip(1))
        {
            se.IsDefault = false;
        }

        Default = SearchEngines.First(x => x.IsDefault); 
    }
}