using Microsoft.AspNetCore.Mvc;

namespace UniversalItemManagement.Server.Controllers
{
	[ApiController]
	[Route("api/app-info")]
	public class AppInfoController : ControllerBase
	{
		[HttpGet]
		public IActionResult Get()
		{
			return Ok(new
			{
				name = "Universal Item Management",
				description = "Dynamic item and list management with custom schemas",
				icon = "🗂️",
				version = "1.0.0",
				category = "Tools",
				links = Array.Empty<object>()
			});
		}
	}
}
