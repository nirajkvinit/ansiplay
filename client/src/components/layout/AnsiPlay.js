import React, { Component } from "react";
import TextFieldGroup from "../common/TextFieldGroup";
// import axios from "axios";
const initialLogg = "Waiting for action...";

class AnsiPlay extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      serverip: "",
      packagename: "",
      privatekeypath: "",
      errors: {},
      loggerData: initialLogg
    };

    this.playbookfile = React.createRef();

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.playAnsible = this.playAnsible.bind(this);
    this.submitAnsibleForm = this.submitAnsibleForm.bind(this);
  }

  onChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  onSubmit(evt) {
    evt.preventDefault();

    let ansibleFile = this.playbookfile.current.files;
    if (ansibleFile.length === 0) {
      this.setState({
        loggerData: "Please select ansible playbook"
      });
    } else {
      let formData = new FormData();
      const file = ansibleFile[0];
      formData.append("name", this.state.name);
      formData.append("serverip", this.state.serverip);
      formData.append("packagename", this.state.packagename);
      formData.append("privatekeypath", this.state.privatekeypath);
      formData.append("playbookfile", file);

      this.setState({
        loggerData: "Submitting the form... waiting for server response..."
      });

      const options = {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      delete options.headers["Content-Type"];

      fetch("/api/ansible", options)
        .then(response => {
          if (response.ok) {
            response.json().then(json => {
              let responseData = json.success;
              this.setState({
                loggerData: responseData,
                errors: {}
              });
            });
          } else {
            response.json().then(json => {
              this.setState({
                loggerData: "Error occured",
                errors: json.error
              });
              console.log(json.error);
            });
          }
        })
        .catch(error => {
          console.log("error occured of type ", error.toString());
        });
    }
  }

  playAnsible(evt) {
    evt.preventDefault();

    this.setState({
      loggerData: "Playing ansible playbook.. waiting for server response..."
    });

    fetch("/api/ansible/run", {
      method: "POST",
      body: {}
    })
      .then(response => {
        if (response.ok) {
          response.json().then(json => {
            let responseData = json.output;
            this.setState({
              loggerData: responseData
            });
          });
        }
      })
      .catch(error => {
        console.log("error occured of type ", error.toString());
      });
  }

  submitAnsibleForm(evt) {
    evt.preventDefault();
    console.log(this.state);
    console.log(this.playbookfile.current.files[0].name);
  }

  render() {
    const { errors } = this.state;
    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-6 m-auto">
              <p className="lead text-center">Ansible Configuration</p>
              <form onSubmit={this.onSubmit}>
                <TextFieldGroup
                  placeholder="Customer Name"
                  name="name"
                  value={this.state.name}
                  onChange={this.onChange}
                  error={errors.name}
                />
                <TextFieldGroup
                  placeholder="Host Name / IP Address"
                  name="serverip"
                  value={this.state.serverip}
                  onChange={this.onChange}
                  error={errors.serverip}
                />
                <TextFieldGroup
                  placeholder="Package Name"
                  name="packagename"
                  value={this.state.packagename}
                  onChange={this.onChange}
                  error={errors.packagename}
                />
                <TextFieldGroup
                  placeholder="Private Key Path"
                  name="privatekeypath"
                  value={this.state.privatekeypath}
                  onChange={this.onChange}
                  error={errors.privatekeypath}
                />
                <label htmlFor="playbookfile">
                  Ansible Playbook File
                  <div className="form-group">
                    <input
                      type="file"
                      id="playbookfile"
                      name="playbookfile"
                      ref={this.playbookfile}
                      accept=".yml"
                    />
                  </div>
                </label>
                <button
                  className="btn btn-info mt-4 btn-block"
                  onClick={this.onSubmit}
                >
                  Save Configuration
                </button>
              </form>

              <button
                className="btn btn-warning btn-block mt-4"
                onClick={this.playAnsible}
              >
                Deploy
              </button>
            </div>
            <div className="col-md-6 m-auto">
              <p className="lead text-center">Logger</p>
              <hr />
              <div className="mh-100 logger-area m-auto">
                {this.state.loggerData}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AnsiPlay;
