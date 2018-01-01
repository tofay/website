// Copyright (c) Microsoft Corporation. All rights reserved.
// SPDX-License-Identifier: MIT

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { uiNavigation, } from '../actions/ui'
import { Grid, Row, Col } from 'react-bootstrap'
import { CurationReview } from './'
import { ROUTE_CURATION } from '../utils/routingConstants'
import EntitySpec from '../utils/entitySpec'
import { getCurationAction } from '../actions/curationActions'
import { getPackageAction, previewPackageAction } from '../actions/packageActions'
import yaml from 'js-yaml'

// Scenarios

class PageCuration extends Component {

  constructor(props) {
    super(props)
    this.state = {}
    this.onCurationChange = this.onCurationChange.bind(this)
  }

  componentDidMount() {
    const { dispatch, path } = this.props
    this.handleNewSpec(path)
    dispatch(uiNavigation({ to: ROUTE_CURATION }))
  }

  componentWillReceiveProps(newProps) {
    // If the spec is changing, kick off some loading to get all the state in order
    const newPath = newProps.path
    if (newPath && this.props.path !== newPath)
      this.handleNewUser(newPath)
  }

  // A new spec has been seleted, fetch all the details
  handleNewSpec(path) {
    if (!path)
      return
    const { dispatch, token } = this.props
    const fullSpec = EntitySpec.fromUrl('cd:' + path);
    this.setState({ ...this.state, entitySpec: fullSpec })
    const currentSpec = Object.assign(Object.create(fullSpec), fullSpec, { pr: null });
    if (fullSpec.pr) {
      dispatch(getCurationAction(token, fullSpec))
      dispatch(getPackageAction(token, fullSpec))
    }
    dispatch(getCurationAction(token, currentSpec))
    dispatch(getPackageAction(token, currentSpec))
    dispatch(previewPackageAction(token, currentSpec, {}))
  }

  onCurationChange(newValue) {

  }

  render() {
    const { entitySpec } = this.state
    if (!entitySpec)
      return null
    const { currentCuration, proposedCuration, currentPackage, rawSummary } = this.props
    if (!(currentCuration.isFetched && currentPackage.isFetched && rawSummary.isFetched))
      return null
    const curationOriginal = currentCuration.item
    const curationValue = proposedCuration.item
    const packageOriginal = currentPackage.item
    const packageValue = rawSummary.item
    // wait for all the data before rendering the editors
    return (
      <Grid className="main-container">
        <Row className="show-grid">
          <Col md={12} >
            <CurationReview
              curationOriginal={curationOriginal}
              curationValue={curationValue}
              packageOriginal={packageOriginal}
              rawSummary={packageValue}
              onChange={this.onCurationChange} />
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    path: ownProps.location.pathname.slice(ownProps.match.url.length),
    token: state.session.token,
    currentCuration: state.curation.current,
    currentPackage: state.package.current,
    proposedCuration: state.curation.proposed,
    rawSummary: state.package.preview
  }
}
export default connect(mapStateToProps)(PageCuration)