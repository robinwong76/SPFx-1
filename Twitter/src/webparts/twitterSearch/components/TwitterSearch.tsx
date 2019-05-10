import * as React from 'react';
import styles from './TwitterSearch.module.scss';
// import { escape } from '@microsoft/sp-lodash-subset';
import { ITwitterService } from '../service/twitter/ITwitterService';
import { Tweets } from './Tweets';
import { PostTweet } from './PostTweet';
import { Message } from './Message';
import ITweet from '../model/ITweet';
import { Requests } from './Requests';
import IRequest from '../model/IRequest';
import { IRequestService } from '../service/request/IRequestService';

export interface ITwitterSearchProps {
  query: string;
  twitterService: ITwitterService;
  requestService: IRequestService;
}

export interface ITwitterSearchState {
  tweetsLoaded: boolean;
  requestsLoaded: boolean;
  refreshCount: number;
  message: string;
  tweets: ITweet[];
  requests: IRequest[];
}

export class TwitterSearch extends React.Component<ITwitterSearchProps, ITwitterSearchState> {

  // Todo: Update to use webhook for updates
  private refreshInterval = 5000; // Refresh every 5 seconds
  private refreshCount = 120;     // for 10 minutes

  constructor(props: ITwitterSearchProps) {
    super(props);
    this.state = {
      tweetsLoaded: false,
      requestsLoaded: false,
      refreshCount: this.refreshCount,
      message: "",
      tweets: [],
      requests: []
    };
  }

  public render(): React.ReactElement<ITwitterSearchProps> {

    if (!this.state.tweetsLoaded) {

      this.props.twitterService.searchTweets(
        this.props.query
      )
        .then((tweets: ITweet[]) => {
          this.setState({ tweetsLoaded: true, message: "", tweets: tweets });
        })
        .catch((message: string) => {
          this.setState({ tweetsLoaded: true, message: message, tweets: [] });
        });

    }

    if (!this.state.requestsLoaded) {
      // Initial load of request list
      this.loadRequests();
    } else if (this.state.refreshCount > 0) {
      // Refresh
      setTimeout(() => { this.loadRequests(); }, this.refreshInterval);
    }

    if (this.state.tweets.length <= 0 &&
      this.state.requests.length <= 0) {

      return (<div>Loading...</div>);

    } else {

      return (
        <div>
          <div className={styles.twitterSearch}>
            <div className={styles.container}>
              <Tweets tweets={this.state.tweets}></Tweets>
            </div>
          </div>
          <div className={styles.requestList}>
            <div className={styles.container}>
              <Requests requests={this.state.requests}></Requests>
            </div>
          </div>
          <div className={styles.messagePanel}>
            <div className={styles.container}>
              <Message message={this.state.message}></Message>
            </div>
          </div>
          <div className={styles.postTweet}>
            <div className={styles.container}>
              <PostTweet twitterService={this.props.twitterService}
                onRefresh={this.refresh.bind(this)} />
            </div>
          </div>
        </div>
      );

    }
  }

  private loadRequests() {
    this.props.requestService.getRequestsForCurrentUser()
      .then((requests: IRequest[]) => {
        this.setState({ 
          requestsLoaded: true, 
          message: "", 
          requests: requests,
          refreshCount: this.state.refreshCount-1
         });
      })
      .catch((message: string) => {
        this.setState({
          requestsLoaded: true,
          message: message,
          requests: [],
          refreshCount: this.state.refreshCount-1
        });
      });
  }

  private refresh() {
    this.setState({ tweetsLoaded: false, message: "Loading" });
  }
}
