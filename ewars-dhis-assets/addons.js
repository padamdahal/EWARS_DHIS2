
try{
	var trackerCapture = angular.module('trackerCapture');
		
	trackerCapture.directive('input', function () {
		
		var link = function ($scope, element, attrs, ngModel) {
			var model = element.attr('ng-model');
			
			if(element.attr('max-date') != undefined){
				var html = element.parent();
				
				// Insert button for nepali calendar
				var customDateField = $('<button class="nepali-calendar"><img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/calendar-512.png"/></button>');
				$(element[0]).after(customDateField);
				//customDateField.appendTo(html);
				customDateField.prev('input').css({"pointer-events":"none"});
						
				// Attach nepali calendar in the input field
				customDateField.calendarsPicker({
					calendar: $.calendars.instance('nepali'),
					maxDate: "0d",
					yearRange: '-120:+0',
					firstDay: 0,
					duration: "fast",
					showAnim: "",
					dateFormat: 'yyyy-mm-dd',
					onSelect: function(npDate) {
						// Convert the date into AD and assign to the date field
						var engDate = BS2AD(npDate[0]._year+'-'+npDate[0]._month+'-'+npDate[0]._day);
						$(element[0]).val(engDate);
						$(element[0]).trigger("change");
						$(element[0]).trigger("blur");
						console.log($(element[0]));
						$('.ui-datepicker-cmd-close').trigger("click");
						
					}
				});
				
				// Get the date
				var ADDate = $(element[0]).val();
				console.log(ADDate);

				if(ADDate != '' || ADDate != null || ADDate != undefined){
					console.log(ADDate);
				}
				
			}
				
			/* filter options for municipality based on selected district*/
			if(model == 'searchText'){
				var parentWithD2 = element[0].parentElement.parentElement.parentElement.parentElement;
											
				if($(parentWithD2).attr('d2-model-id') === 'prStDes.hLXJqD7b9im.dataElement.id'){
					if($scope.d2Model.OgXR2MrpMuB != null && $scope.d2Model.OgXR2MrpMuB != 'undefined'){
						$scope.searchText = $scope.d2Model.OgXR2MrpMuB.substr(0, 3);
						$scope.search($scope.d2Model.OgXR2MrpMuB.substr(0, 3));
					}
				}
			}
					
			// Auto upper case in all input
			$(element[0]).change(function(){
				var val = $(element[0]).val().toUpperCase();
				$(element[0]).val(val);
			});
			
			// Age Variable - currentEvent.caMyqMax9y7
			/*
			if(model == 'currentEvent.caMyqMax9y7'){
				var parent = element[0].parentElement;
				// Limit age variables to 3, 2,3 for years, month and day respectively
				var html = '<input type="text" pattern="\d*" maxLength="3" style="width:30% !important;float:left;" class="age-additional" id="age-year" placeholder="Year"/>';
				html += '<input type="text" pattern="\d*" maxLength="2" style="width:30% !important;float:left;" class="age-additional" id="age-month" placeholder="Month"/>';
				html += '<input type="text" pattern="\d*" maxLength="3" style="width:30% !important;float:left;" class="age-additional" id="age-day" placeholder="Day"/>';
					
				var options = $(html);
				options.appendTo(parent);
				$(element[0]).css('pointer-events','none');
				$(element[0]).css('border','none');
				$(element[0]).css('-webkit-box-shadow','none');
						
				if($scope.currentEvent.caMyqMax9y7 != '' || $scope.currentEvent.caMyqMax9y7 != null){
					var year = parseInt($scope.currentEvent.caMyqMax9y7) || '';
					$('body #age-year').val(year);
					var month = ($scope.currentEvent.caMyqMax9y7 - parseInt($scope.currentEvent.caMyqMax9y7))*12;
					$('body #age-month').val(parseInt(month) || '');
					var day = (month - parseInt(month))*30
					day = parseInt(day) || '';
					$('body #age-day').val(day);
				}
				////////////////////
												
				$('body #age-day').change(function(){	
					var day = parseInt($('body #age-day').val()) || 0;
					var month = parseInt($('body #age-month').val()) || 0;
					var year = parseInt($('body #age-year').val()) || 0;
					var newValue = year+month/12+day/365;
							
					$(element[0]).val(newValue.toFixed(3));
					$(element[0]).trigger("change");
				});
						
				$('body #age-month').change(function(){
					var day = parseInt($('body #age-day').val()) || 0;
					var month = parseInt($('body #age-month').val()) || 0;
					var year = parseInt($('body #age-year').val()) || 0;
					var newValue = year+month/12+day/365;
							
					$(element[0]).val(newValue.toFixed(3));
					$(element[0]).trigger("change");
				});
						
				$('body #age-year').change(function(){
					var day = parseInt($('body #age-day').val()) || 0;
					var month = parseInt($('body #age-month').val()) || 0;
					var year = parseInt($('body #age-year').val()) || 0;
					var newValue = year+month/12+day/365;
							
					$(element[0]).val(newValue.toFixed(3));
					$(element[0]).trigger("change");
				});
			}
			*/
		};
		return { link: link };
	});
}catch(e){
	console.log('trackerCapture app is not initialized.');
}