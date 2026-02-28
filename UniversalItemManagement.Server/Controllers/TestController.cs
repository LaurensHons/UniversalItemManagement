using Microsoft.AspNetCore.Mvc;

namespace UniversalItemManagement.Server.Controllers
{
    /// <summary>
    /// Test controller for demonstrating exception handling middleware
    /// Should be removed in production
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger)
        {
            _logger = logger;
        }

        [HttpGet("throw-argument-null")]
        public IActionResult ThrowArgumentNull()
        {
            throw new ArgumentNullException("testParam", "This is a test exception");
        }

        [HttpGet("throw-not-found")]
        public IActionResult ThrowNotFound()
        {
            throw new KeyNotFoundException("Test entity not found");
        }

        [HttpGet("throw-unauthorized")]
        public IActionResult ThrowUnauthorized()
        {
            throw new UnauthorizedAccessException("Test access denied");
        }

        [HttpGet("throw-invalid-operation")]
        public IActionResult ThrowInvalidOperation()
        {
            throw new InvalidOperationException("Test invalid operation");
        }

        [HttpGet("throw-unhandled")]
        public IActionResult ThrowUnhandled()
        {
            throw new Exception("Test unhandled exception");
        }

        [HttpGet("success")]
        public IActionResult Success()
        {
            return Ok(new { message = "Request succeeded" });
        }
    }
}
