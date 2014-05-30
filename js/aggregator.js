function GithubIssuesAggregator(){
    this.processIssues = function(callback){

        var allIssues = [];
        var repos = [];

        $.getJSON('./config.json',undefined)
        .done(function(config_data){

            for(var i = 0; i < config_data.repos.length; i++){
                repo = config_data.repos[i].split('/');
                repos.push(repo[repo.length - 1]);
            }

            var base_url = 'https://api.github.com/repos/Mozilla/';
            var url_suffix = '/issues?per_page=100&state=open&sort=created&access_token=' + config_data.api_token;
            
            for(i = 0; i < repos.length; i++){
                (function(index){

                    var repo = repos[index];
                    var issues = [];

                    $.getJSON(base_url+repo+url_suffix)
                        .done(function(data){
                            issues = [];
                            for(var j = 0; j < data.length; j++){
                                issue = data[j];

                                if(issue.assignee){
                                    assignee = {'name': issue.assignee.login, 'avatar_url':issue.assignee.avatar_url};
                                }
                                else{
                                    assignee = '';
                                }

                                var issueObject = {'assignee': assignee,
                                                   'pull_request': typeof issue.pull_request != "undefined"
                                                  };

                                misc = ['updated_at', 'title', 'body', 'number', 'html_url', 'comments']
                                for(var k = 0; k < misc.length; k++){
                                    issueObject[misc[k]] = issue[misc[k]];
                                }

                                labels = []
                                for(k = 0; k < issue.labels.length; k++){
                                    label = issue.labels[k];
                                    labels.push({'name':label.name, 'color':label.color});
                                }

                                issueObject['labels'] = labels;
                                issues.push(issueObject);
                            }
                            allIssues.push({'repo': repo, 'issues': issues})

                            if(index === repos.length-1){

                                allIssues.sort(function(a, b){
                                    if(a.repo.toLowerCase() < b.repo.toLowerCase()){
                                        return -1;
                                    } if (a.repo.toLowerCase() > b.repo.toLowerCase()){
                                        return 1;
                                    } else {
                                        return 0;
                                    }
                                })

                                finalIssues = {'last_updated': new Date(Date.now()).toISOString(),
                                               'issues': allIssues
                                              };

                                callback(finalIssues);
                                return;
                            }
                        })
                })(i)
            }

        })

    }
}
