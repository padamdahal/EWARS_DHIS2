$(document).ready(function(){
	
	console.log('document ready');
	var input = $('input');
	console.log(input);
});


try{
	var trackerCapture = angular.module('trackerCapture');
		
	trackerCapture.directive('input', function () {
		var link = function ($scope, element, attrs, ngModel) {
			var model = element.attr('ng-model');
			
			if(element.attr('max-date') != undefined){
				var html = element.parent();
				
				// Insert text input for nepali date
				//var customDateField = $('<input type="text" class="customDatePicker form-control ng-pristine ng-untouched ng-invalid ng-invalid-required ng-invalid-date-validator ng-invalid-future-date-validator" placeholder="Select Nepali Date" style="position:relative;float:left;display:block;width:50% !important"/>');
				var customDateField = $('<a href="#">Pick a date</a>');
				
				$(element[0]).after(customDateField);
				//customDateField.appendTo(html);
				customDateField.prev('input').css({"pointer-events":"none","color":"#ccc","position":"relative","float":"left","width":"30% !important","display":"content"});
						
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
						var engDate = BS2AD(npDate[0]._year+'-'+npDate[0]._month+'-'+npDate[0]._day);
						$(this).prev('input').val(engDate);
						$(this).prev('input').trigger("change");
						$(this).prev('input').trigger("blur");
						$('.ui-datepicker-cmd-close').trigger("click");
								
						// Display week number
						if(model === 'currentEvent.eventDate'){
							$("body .weekNumber").html('Week '+epiWeek);
						}
					}
				});
				
				
				// Function to calculate the epidemiology week from selected date
				function calculateEpiWeekFromDate(value){
					Date.prototype.getWeek = function (){
						var target = new Date(this.valueOf());
						var dayPs = (this.getDay() + 7) % 7;
						target.setDate(target.getDate() - dayPs + 3);
						var jan4 = new Date(target.getFullYear(), 0, 4);
						var dayDifference = (target - jan4) / 86400000;
						if (new Date(target.getFullYear(), 0, 1).getDay() < 4){
							return 1 + Math.ceil(dayDifference / 7);
						}else{
							return Math.ceil(dayDifference / 7);
						}
					};
					var weekNumber = new Date(value).getWeek()
					return weekNumber;
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
			
			console.log(model);
			// Age Variable - currentEvent.caMyqMax9y7
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
		};
		return { link: link };
	});
}catch(e){
	console.log('trackerCapture app is not initialized.');
}