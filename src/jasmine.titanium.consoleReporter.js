(function()
{
	if (!jasmine)
	{
		throw new Exception("jasmine library does not exist in global namespace !");
	}
	
	/**
	 * TitaniumConsoleReporter, from https://github.com/larrymyers/jasmine-reporters
	 * <p>
	 * TitaniumConsoleReporter is a Jasmine reporter using Titanium API logging.
	 * </p>
	 * @see jasmine.Reporter
	 */
	var TitaniumConsoleReporter = function()
	{
		
	};
	
	TitaniumConsoleReporter.prototype =
	{
		reportRunnerResults: function(runner)
		{
			
		},
		
		reportRunnerStarting: function(runner)
		{
			Titanium.API.info("TEST : Runner Started.");
		},
		
		reportSpecResults: function(spec)
		{
			var specResults = "(" + spec.results().passedCount + " OK, " + spec.results().failedCount + " KO)";
			
			if (spec.results().passed())
			{
				Titanium.API.info("TEST : " + spec.description + " " + specResults);
			}
			else
			{
				Titanium.API.error("TEST : " + spec.description + " " + specResults);
				
				for (var i = 0; i < spec.results().items_.length; i++)
				{
					if (!spec.results().items_[i].passed_)
					{
						Titanium.API.error("\t" + spec.results().items_[i].message);
					}
					
					if (spec.results().items_[i].expected)
					{
						Titanium.API.error("\tExpected : " + spec.results().items_[i].expected);
					}
					
					Titanium.API.error("\tActual result : " + spec.results().items_[i].actual);
				}
			}
		},
		
		reportSpecStarting: function(spec)
		{
			
		},
		
		reportSuiteResults: function(suite)
		{
			Titanium.API.info("TEST : [" + suite.description + "] " + suite.results().passedCount + " of " + suite.results().totalCount + " assertions passed.");
		}
	};
	
	jasmine.TitaniumConsoleReporter = TitaniumConsoleReporter;
})();