(function()
{
	if (!jasmine)
	{
		throw new Exception("jasmine library does not exist in global namespace !");
	}
	
	function elapsed(startTime, endTime)
	{
		return (endTime - startTime) / 1000;
	}
	
	function ISODateString(d)
	{
		function pad(n)
		{
			return n < 10 ? '0' + n : n;
		}
		
		return d.getFullYear() + '-' +
			pad(d.getMonth()+1) + '-' +
			pad(d.getDate()) + 'T' +
			pad(d.getHours()) + ':' +
			pad(d.getMinutes()) + ':' +
			pad(d.getSeconds());
	}
	
	function trim(str)
	{
		return str.replace(/^\s+/, "" ).replace(/\s+$/, "" );
	}
	
	function escapeInvalidXmlChars(str)
	{
		return str.replace(/\&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/\>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/\'/g, "&apos;");
	}
	
	/**
	 * TitaniumJUnitXmlReporter, from https://github.com/larrymyers/jasmine-reporters
	 * <p>
	 * TitaniumJUnitXmlReporter is a Jasmine reporter using Titanium API to generate and write JUnit XML reports.
	 * </p>
	 * @see jasmine.Reporter
	 */
	var TitaniumJUnitXmlReporter = function()
	{
		
	};
	
	TitaniumJUnitXmlReporter.prototype =
	{
		reportRunnerResults: function(runner)
		{
			var logDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "log");
			
			if (logDir.exists())
			{
				logDir.deleteDirectory(true);
			}
			
			Titanium.API.info("TEST : create log directory : " + logDir.nativePath);
			logDir.createDirectory();
			
			var suites = runner.suites();
			
			for (var i = 0; i < suites.length; i++)
			{
				var suite = suites[i];
				var fileName = "TEST-" + this.getFullName(suite, true) + ".xml";
				var output = '<?xml version="1.0" encoding="UTF-8" ?>';
				
				//output += "\n<testsuites>";
				output += this.getNestedOutput(suite);
				//output += "\n</testsuites>";
				
				var logFile = Titanium.Filesystem.getFile(logDir.nativePath, fileName);
				Titanium.API.info("TEST : log file : " + logFile.nativePath);
				logFile.write(output);
			}
			
			var endFile = Titanium.Filesystem.getFile(logDir.nativePath, "TEST_OK");
			endFile.write("");
		},
		
		reportRunnerStarting: function(runner)
		{
			
		},
		
		reportSpecResults: function(spec)
		{
			var results = spec.results();
			spec.didFail = !results.passed();
			spec.status = spec.didFail ? "Failed." : "Passed.";
			
			if (results.skipped)
			{
				spec.status = "Skipped.";
			}
			
			spec.duration = elapsed(spec.startTime, new Date());
			
			spec.output = '\n\t<testcase classname="' +
				this.getFullName(spec.suite) +
				'" name="' +
				escapeInvalidXmlChars(spec.description) +
				'" time="' +
				spec.duration +
				'">';
			
			var failure = "";
			var failures = 0;
			var resultItems = results.getItems();
			
			for (var i = 0; i < resultItems.length; i++)
			{
				var result = resultItems[i];
				
				if (result.type == "expect" && result.passed && !result.passed())
				{
					failures += 1;
					failure += (failures + ": " + escapeInvalidXmlChars(result.message) + " ");
				}
			}
			
			if (failure)
			{
				spec.output += "\n\t\t<failure>" + trim(failure) + "</failure>";
			}
			
			spec.output += "\n\t</testcase>";
		},
		
		reportSpecStarting: function(spec)
		{
			spec.startTime = new Date();
			
			if (!spec.suite.startTime)
			{
				spec.suite.startTime = spec.startTime;
			}
		},
		
		reportSuiteResults: function(suite)
		{
			var results = suite.results();
			var specs = suite.specs();
			var specOutput = "";
			var failedCount = 0;
			
			suite.status = results.passed() ? "Passed." : "Failed.";
			
			if (results.totalCount === 0)
			{
				// todo: change this to check results.skipped
				suite.status = "Skipped.";
			}
			
			suite.startTime = suite.startTime || new Date();
			suite.duration = elapsed(suite.startTime, new Date());
			
			for (var i = 0; i < specs.length; i++)
			{
				failedCount += specs[i].didFail ? 1 : 0;
				specOutput += specs[i].output;
			}
			
			suite.output = '\n<testsuite name="' +
				this.getFullName(suite) +
				'" errors="0" tests="' +
				specs.length +
				'" failures="' +
				failedCount +
				'" time="' +
				suite.duration +
				'" timestamp="' +
				ISODateString(suite.startTime) +
				'">';
			
			suite.output += specOutput;
			suite.output += "\n</testsuite>";
		},
		
		getNestedOutput: function(suite)
		{
			var output = suite.output;
			
			for (var i = 0; i < suite.suites().length; i++)
			{
				output += this.getNestedOutput(suite.suites()[i]);
			}
			
			return output;
		},
		
		getFullName: function(suite, isFilename)
		{
			var fullName;
			
			fullName = suite.description;
			
			for (var parentSuite = suite.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite)
			{
				fullName = parentSuite.description + '.' + fullName;
			}
			
			// Either remove or escape invalid XML characters
			if (isFilename)
			{
				return fullName.replace(/[^\w]/g, "");
			}
			
			return escapeInvalidXmlChars(fullName);
		}
	};
	
	jasmine.TitaniumJUnitXmlReporter = TitaniumJUnitXmlReporter;
})();