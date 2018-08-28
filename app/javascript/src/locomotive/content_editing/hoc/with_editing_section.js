import React from 'react';
import { Redirect } from 'react-router-dom';
import { find, pick, bindAll } from 'lodash';
import { fetchSectionContent } from '../services/sections_service';
import { fetchBlockContent } from '../services/blocks_service';

const withEditingSection = Component => {

  // Enhance the props
  const buildNewProps = props => {
    var newProps = pick(props.match.params, [
      'sectionId', 'blockType', 'blockId', 'settingType', 'settingId'
    ]);

    // 1. find the section
    newProps.section            = props.sections.all[newProps.sectionId];

    if (newProps.section) {
      // 2. find the section definition and the content of the section
      newProps.sectionDefinition  = props.findSectionDefinition(newProps.section.type);
      newProps.sectionContent     = fetchSectionContent(props.globalContent, newProps.section);

      // 3. (if possible) find the block definition and the content of the block
      newProps.blockDefinition    = props.findBlockDefinition(
        newProps.sectionDefinition,
        newProps.blockType
      )
      newProps.blockContent       = fetchBlockContent(newProps.sectionContent, newProps.blockId);
    }

    return Object.assign({}, props, newProps);
  }

  // Helpers
  const isEditingSection  = props => props.sectionId && props.sectionContent
  const isEditingBlock    = props => props.blockId && props.blockContent
  const isEditingSetting  = props => props.settingType && props.settingId
  const isEditing         = props => isEditingSection(props) || isEditingBlock(props)
  const editingType = props => {
    if (isEditingSetting(props) && isEditingBlock(props))   return 'block_setting';
    if (isEditingSetting(props) && isEditingSection(props)) return 'section_setting';
    if (isEditingBlock(props))    return 'block';
    if (isEditingSection(props))  return 'section';
    return null;
  }

  // Notifications

  const notifyOnEnter = props => {
    props.selectSection(props.section, props.blockId);
  }

  const notifyOnLeave = props => {
    props.deselectSection(props.section, props.blockId);
  }

  // Path helper

  const parentPath = props => {
    switch(editingType(props)) {
      case 'section':
        return props.sectionsPath();
      case 'section_setting':
      case 'block':
        return props.editSectionPath(props.section);
      case 'block_setting':
        return props.editBlockPath(props.section, props.blockType, props.blockId);
    }
  }

  // Callbacks

  const handleChange = (props, settingType, settingId, newValue) => {
    const { section, blockId, updateSectionInput } = props;

    updateSectionInput(section, blockId, settingType, settingId, newValue);
  }

  class WrappedComponent extends React.Component {

    constructor(props) {
      super(props);
      bindAll(this, 'leaveView', 'handleChange');
    }

    componentDidMount() {
      notifyOnEnter(this.props);
    }

    leaveView() {
      notifyOnLeave(this.props);
      this.props.redirectTo(parentPath(this.props));
    }

    handleChange(settingType, settingId, newValue) {
      handleChange(this.props, settingType, settingId, newValue);
    }

    render() {
      return (
        <Component
          leaveView={this.leaveView}
          handleChange={this.handleChange}
          {...this.props}
        />
      )
    }

  }

  return function WithEditingSection(props) {
    const newProps = buildNewProps(props);

    return isEditing(newProps) ? (
      <WrappedComponent
        {...newProps}
      />
    ) : (
      <Redirect to={{ pathname: '/' }} />
    )
  }

}

export default withEditingSection;
