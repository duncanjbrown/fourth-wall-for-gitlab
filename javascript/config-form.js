(function($) {
  var FourthWallConfiguration = function() {
    this.token = localStorage.getItem('token');
    this.gitlab_host = localStorage.getItem('gitlab_host');
  }

  FourthWallConfiguration.prototype.save = function() {
    localStorage.setItem('token', this.token);
    localStorage.setItem('gitlab_host', this.gitlab_host);
    $(this).trigger('updated');
  }

  var FourthWallConfigurationForm = function(form, config) {
    this.form = form;
    this.statusField = $('#form-status', form)
    this.config = config;

    this.form.submit(this.onSubmit.bind(this));
  };

  FourthWallConfigurationForm.prototype.updateStatus = function(string) {
    this.statusField.text(string).show();
  };

  FourthWallConfigurationForm.prototype.onSubmit = function(e) {
    var values = this.form.serializeArray();
    for( var i in values ) {
      this.config[values[i].name] = values[i].value;
    }
    this.config.save();
    this.updateStatus('Data saved!');
    return false;
  }

  var FourthWallConfigurationDisplay = function(element) {
    this.configurationList = element;
  };

  FourthWallConfigurationDisplay.prototype.display = function(config) {
    var tokenValue = $('<li>').text('Token: ' + config.token);
    var hostnameValue = $('<li>').text('Hostname: ' + config.gitlab_host);

    this.configurationList.empty();
    this.configurationList.append(tokenValue);
    this.configurationList.append(hostnameValue);
  };

  $(document).ready(function() {
    var form = $('#fourth-wall-config');
    var savedValues = $('#saved-values');

    var config = new FourthWallConfiguration();
    var form = new FourthWallConfigurationForm(form, config);
    var configDisplay = new FourthWallConfigurationDisplay(savedValues);
    configDisplay.display(config);

    $(config).on('updated', function() {
      configDisplay.display(config);
    });

  });

})(jQuery);
