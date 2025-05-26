using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebTorrentRazorPlayer.Pages
{
    public class BeautyModel : PageModel
    {
        private readonly ILogger<BeautyModel> _logger;

        public BeautyModel(ILogger<BeautyModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }
    }

}
